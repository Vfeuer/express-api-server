var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel")
const { getNodesStatus,
        renameNode, 
        getNodesList,
        changeNodeSetting} = require('../controller/nodeControl')
const {pressButtonB} = require('../controller/pubControl')

/* GET nodes listing. */
router.get('/list', (req, res, next) => {
  id = req.query.id
  const result = getNodesList(id)
  return result.then(NodesList => {
      res.json (
        new SuccessModel({'msg': 'successfully get the list of mesh', 'status': 200}, NodesList)
      )
  })
});

/* GET nodes status. */
router.get('/status', (req, res, next) => {
  id = req.query.id
  const result = getNodesStatus(id)
  return result.then(nodeStatus => {
    res.json (
      new SuccessModel({'msg': 'successfully get the status of mesh', 'status': 200}, nodeStatus)
    )
  })
});

/* Put the name of a node */
router.put('/list', (req, res, next) => {
  const {id, nodeName} = req.body
    if(id){
      const result = renameNode(id, nodeName)
      return result.then(val => {
          if (val) {
            return res.json( new SuccessModel({'msg': 'successfully rename the node', 'status': 202})
          )}
          return res.json(
            new ErrorModel({'msg': 'Failed to rename the node because of no such id of node', 'status': 422})
          )
      })
    }
    return res.json(
      new ErrorModel({'msg': 'Failed to rename the node because of no id', 'status': 400})
    )
});

/* Put the setting of a node */
router.put('/status',(req, res, next) => {
  const {id, macADR, maxCur, workmode, workStatus, Phases} = req.body
    if(id){
      const result = changeNodeSetting(id, macADR, maxCur, workmode, workStatus, Phases)
      return result.then(val => {
          if (val) {
            return  res.json( new SuccessModel({'msg': 'successfully change the setting the node', 'status': 202})
          )}
          return res.json(
            new ErrorModel({'msg': 'Failed to change the setting of the node', 'status': 404})
          )
      })
    }
    return res.json(
      new ErrorModel({'msg': 'Failed to change the setting of the node because of no id', 'status': 400})
    )
});

// function to press button B, only for test
router.put('/buttonB', (req, res, next)=> {
  const {macADR} = req.body
  pressButtonB(macADR)
  return res.json( new SuccessModel({'msg': 'successfully pressed button B remotely', 'status': 200}))
});

module.exports = router;