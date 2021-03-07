const { dbExec, escape } = require('../db/mysql')
const {setPhase, setMaxCur} = require('./pubControl')
const {sumManCur, calRemain, autoWork } = require('./dataControl')

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
    let sql = `select id, nodeName, macADR, connect from nodestatus `
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
const renameNode = (id, nodeName = {})  => {
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

// function to post the setting of node to database and node
const changeNodeSetting = (id, macADR, maxCur = null, workmode = null, workStatus= null, Phases = null)  => {
    id = escape(id)
    workStatus = escape(workStatus)
    if( workmode === 'auto') {
        maxCur = 0
        Phases = 0
    }
    workmode = escape(workmode)
    
    let sql = `select connect from nodestatus where id= ${id}`
    return dbExec(sql).then(rows => {
        if (!rows[0].connect) {
            return false
        }
        // update the workmode and maxCur in database at first
        sql = `update nodestatus set workmode=${workmode}, maxCur = ${escape(maxCur)} where id= ${id};`
        return dbExec(sql).then(updateData =>{
            if (updateData.affectedRows > 0) {
                setPhase(macADR, Phases)
                return sumManCur().then(val =>{
                    if(!val) {
                        return false // no connection to database
                    }
                    return calRemain().then(remain => {
                        if (!remain[1]||!remain[2]||!remain[3]) {
                            return false
                        }
                        setMaxCur(macADR, maxCur)
                        setPhase(macADR, Phases)
                        Phases = escape(Phases)
                        maxCur = escape(maxCur)
                        sql = `update nodestatus set maxCur=${maxCur}, workStatus=${workStatus}, workmode=${workmode}, Phases=${Phases} where id=${id};`
                        return dbExec(sql).then(updateData =>{
                            if (updateData.affectedRows > 0) {
                                return autoWork().then(val => {
                                    if(val) {
                                        return true
                                    }
                                    return false
                                })
                            }
                            return false
                        })
                    })
                })
            }
            return false // err: failed to change the workmode and maxcur of node, no connection to database
        })
    })
}

module.exports = {
    getNodesStatus,
    getNodesList,
    renameNode,
    changeNodeSetting
}