const { dbExec, escape } = require('../db/mysql')
const {scanMesh} = require('./initControl')

// function to intialize the mesh, scan the mesh 30s to register all nodes
const meshInit = () => {
    const scanRes = scanMesh('/DEMESH/+'+'/heartbeat')
    setTimeout(() => {
        scanRes.end()
        return true
    }, 30000)
}

// function to get setting of mesh from database
const getMeshSetting = () => {
    let sql = `select * from meshsetting `
    // return promise object 
    return dbExec(sql).then(meshSetting =>{
        if(meshSetting[0]){
            return meshSetting[0]
            }
        return {}
    })
}

// function to put setting of mesh into database
const changeMeshSetting = (wholeMax)  => {
    wholeMax = escape(wholeMax)

    let sql = `update meshsetting set wholeMax=${wholeMax} where id=1;`
    // return promise object 
    return dbExec(sql).then(updateData =>{
        if (updateData.affectedRows > 0) {
            return true
        }
        return false
    })
}

module.exports = {
    getMeshSetting,
    changeMeshSetting,
    meshInit
}