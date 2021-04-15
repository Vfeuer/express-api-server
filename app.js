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
const {readData} = require('./component/controller/subControl')
var bodyParser = require('body-parser');
var multer  = require('multer');
const http = require('http')
var aedesMqtt = require('./component/db/aedesMqtt').aedesMqtt
var aedesPersistenceRedis = require('aedes-persistence-redis')
 
var usersRouter = require('./component/routes/users');
var nodesRouter = require('./component/routes/nodes');
var meshRouter = require('./component/routes/mesh')
var uploadRouter = require('./component/routes/upload')

var app = express();

// front-end
app.use(compression())
app.use(express.static('./dist'))
app.listen(8071, '0.0.0.0')

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

app.use(express.static('public')); // set the path where the static file is
// app.use('/public', express.static('public')); // set the path where the static file is
app.use(bodyParser.urlencoded({ extended: false })); // if the request body is not json, convert the request body into an object
app.use(multer({ dest: '/tmp/'}).array('file'));

const redisClient = require('./component/db/redis')
const sessionStore = new RedisStore ({
  client : redisClient
})

app.use(session({
  secret: 'j1@jf93$8',
  cookie: {
    // path: '/',  // default setting
    // httpOnly: true, // default setting
    maxAge: 1 * 60 * 60 * 1000
  },
  store: sessionStore
}))

// app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/nodes', nodesRouter);
app.use('/api/mesh', meshRouter);
app.use('/api/upload', uploadRouter)

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

// set up mqtt server
var adeasSettings = {
  persistence: aedesPersistenceRedis({
      port: 6379,          // Redis port
      host: '127.0.0.1',   // Redis host
      family: 4,           // 4 (IPv4) or 6 (IPv6)
      db: 0,
      maxSessionDelivery: 100, // maximum offline messages deliverable on client CONNECT, default is 1000
      packetTTL: function (packet) { // offline message TTL, default is disabled
        return 10 //seconds
      }
  })
}
var mqttPort = 1884
var wsPort = 9001
var mqttServer = new aedesMqtt(adeasSettings, mqttPort, wsPort)
function subCB (subscriptions, client) {
  console.log(subscriptions)
  console.log(client.id)
}
mqttServer.sub(subCB)
//start the mqtt read task 
readData()

module.exports = app;
