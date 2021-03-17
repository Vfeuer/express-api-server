const { dbExec, escape } = require('../db/mysql')
const {genPassword} = require('./pwdControl')
var jwt = require('jsonwebtoken')
const {jwtKey} = require('../../conf/configuration')

const login = (username, password) => {
    var content = {username: username}
    username = escape(username)
    password = escape(password)

    // generate the secret password from origin password
    password = genPassword(password)

    const sql = `select * from user where password='${password}' and username=${username};`
    return dbExec(sql).then(userinfo =>{
        if(userinfo[0]){
        var token = jwt.sign(content, jwtKey, {
            expiresIn: 1 * 60 * 60 * 1000 // 24小时过期,以s作为单位
            })
        // if(username == escape('admin')) {
        //     token = 'Bearer '+token
        // }
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

const addUser = (username, password) => {
    console.log('adduser')
    username = escape(username)
    password = escape(password)
    password = `'${genPassword(password)}'`
    let sql = `insert into user (username, password) values (${username}, ${password});`
    return dbExec(sql).then(updateData =>{
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

module.exports = {
    login,
    changePWD,
    addUser
}

