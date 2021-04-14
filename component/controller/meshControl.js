const {queryData, dataExec, escape} = require('../db/sqlite')

// function to intialize the mesh, scan the mesh 30s to register all nodes
const meshInit = () => {
    let sql =`delete from nodestatus;`
    return dataExec(sql).then(updateData => {
        if (updateData.changes <= 0) {
            return false
        }
        return true
    })
}

// function to get setting of mesh from database
const getMeshSetting = () => {
    let sql = `select * from meshsetting;`
    // return promise object 
    return queryData(sql).then(meshSetting =>{
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
    return dataExec(sql).then(updateData =>{
        if (updateData.changes > 0) {
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