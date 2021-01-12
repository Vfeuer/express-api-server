const { dbExec, escape } = require('../db/mysql')
const {genPassword} = require('./pwdControl')
var jwt = require('jsonwebtoken')
var jwtKEY = 'N27#K$5m_P[C'

const login = (username, password) => {
    username = escape(username)
    password = escape(password)
    var content = {msg:`{username: ${username}}`}

    // generate the secret password from origin password
    password = genPassword(password)

    const sql = `select * from user where password='${password}' and username=${username};`
    return dbExec(sql).then(userinfo =>{
        if(userinfo[0]){
        var token = jwt.sign(content, jwtKEY, {
            expiresIn: 3 * 60 * 60 * 1000 // 24小时过期,以s作为单位
            })
        userinfo[0].token = token
        userinfo[0].password = '****'
        return userinfo[0]  // wrong password -> data is null
        }
        return {}
    })
}

const changePWD = (username, newpassword) => {
    username = escape(username)
    newpassword = escape(newpassword)
    
    // generate the secret password from origin password
    newpassword = `'${genPassword(newpassword)}'`

    let sql = `update user set password=${newpassword} where username=${username};`
    
    return dbExec(sql).then(updateData =>{
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

module.exports = {
    login,
    changePWD
}

