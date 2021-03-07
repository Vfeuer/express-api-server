var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fs = require('fs');
var cors = require('cors')()
const session = require('express-session')
const RedisStore = require('connect-redis')(session)
const compression = require('compression')
const {scanMesh} = require('./component/controller/initControl.js')
const {readCurrent} = require('./component/controller/subControl')

var usersRouter = require('./component/routes/users');
var nodesRouter = require('./component/routes/nodes');
var meshRouter = require('./component/routes/mesh')

var app = express();

app.use(compression())
app.use(express.static('./dist'))

app.listen(80)

app.use(cors)

// logger for different environment development and production
const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  app.use(logger('dev'))
} else {
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags : 'a'
  })
  app.use(logger('combined', {
    stream: writeStream
  }))
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

const redisClient = require('./component/db/redis')
const sessionStore = new RedisStore ({
  client : redisClient
})

app.use(session({
  secret: 'j1@jf93$8',
  cookie: {
    // path: '/',  // default setting
    // httpOnly: true, // default setting
    maxAge: 3 * 60 * 60 * 1000
  },
  store: sessionStore
}))

// app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/mesh', meshRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'dev' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// scan the mesh for 30s to find whether there is new node to add and then start the read task
const scanRes = scanMesh('/DEMESH/+'+'/heartbeat')
setTimeout(() => {
    scanRes.end()
    
    // // subscribe to the node by the way each node has a client
    // getList().then(meshList => {
    //     for (var i = 0; i < meshList.length; i++) {
    //         connectUpdate(meshList[i].id, meshList[i].macADR)  // default set all the nodes as no connection 
    //         readCurrent('/DEMESH/'+meshList[i].macADR+'/heartbeat', meshList[i].id, meshList[i].macADR) //new?
    //     }
    // })

    // one client subscribe to all the nodes that has been registed
    readCurrent()
}, 500)

module.exports = app;
