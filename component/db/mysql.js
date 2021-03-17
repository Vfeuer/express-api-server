const mysql = require('mysql')
const {MYSQL_CONF} = require('../../conf/configuration')


// Establish connection with the database
const db = mysql.createConnection(MYSQL_CONF)

// start the connection
db.connect()

// sql function
function dbExec(sql) {
    const promise = new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if (err) {
                reject(err)
                return
            }
            resolve(result)
        })
    })
    return promise
}

module.exports = {
    dbExec,
    escape: mysql.escape
}