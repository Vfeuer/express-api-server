const { dbExec, escape } = require('../db/mysql')

// function to get nodestatus from database
const getNodesStatus = (id = {}) => {
    id = escape(id)
    let sql = `select * from nodestatus `
    if (id) {
        sql += `where id = ${id};`
        return dbExec(sql).then(rows =>{
            if(rows[0]){
                return rows[0]  // wrong password -> data is null
            }
        })
    }
    sql += `order by id;`
    // return promise object 
    return dbExec(sql)
}

// function to get nodelist from database
const getNodesList = (id = {}) => {
    let sql = `select id, nodeName, ipADR, macADR, connect from nodestatus `
    id = escape(id)
    if (id) {
        sql += `where id = ${id};`
        return dbExec(sql).then(rows =>{
            if(rows[0]){
                return rows[0]  // wrong password -> data is null
            }
        })
    }
    sql += `order by id;`
    // return promise object 
    return dbExec(sql)
}

// function to put the name of node into database
const renameNode = (id, nodeName = {} )  => {
    id = escape(id)
    nodeName = escape(nodeName)
    const sql = `update nodestatus set nodeName=${nodeName} where id=${id};`  
    // return promise object 
    return dbExec(sql).then(updateData =>{
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

// function to post the setting of node into database
const changeNodeSetting = (id, maxCurrent = {}, workmode = {}, workStatus = {})  => {
    id = escape(id)
    workStatus = escape(workStatus)
    maxCurrent = escape(maxCurrent)
    workmode = escape(workmode)
    const sql = `update nodestatus set maxCurrent=${maxCurrent}, workStatus=${workStatus}, workmode=${workmode} where id=${id};`
    // return promise object 
    return dbExec(sql).then(updateData =>{
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}


module.exports = {
    getNodesStatus,
    getNodesList,
    renameNode,
    changeNodeSetting
}