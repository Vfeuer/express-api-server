var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel")
const { getMeshSetting, changeMeshSetting, meshInit } = require('../controller/meshControl')
const adminCheck = require('../midware/adminCheck')

/* GET mesh setting. */
router.get('/setting', (req, res, next) => {
  const result = getMeshSetting()
  return result.then(MeshSetting => {
    if (MeshSetting.id !== 1) {
      return res.json (
        new ErrorModel({'msg': 'Failed to get the setting of mesh', 'status': 400}, MeshSetting)
      )}
    return res.json (
      new SuccessModel({'msg': 'successfully get the setting of mesh', 'status': 200}, MeshSetting)
    )
  })
});

/* Post mesh setting. */
router.post('/setting', adminCheck, (req, res, next) => {
  const { wholeMax, safeMax } = req.body
  const result = changeMeshSetting(wholeMax, safeMax)
  return result.then(val => {
    if (val) {
      return res.json( new SuccessModel({'msg': 'successfully change the setting of mesh', 'status': 202})
    )}
    return res.json(
      new ErrorModel({'msg': 'Failed to get the setting of mesh', 'status': 500})
    )
})
});

/* initialize the whole mesh. */
router.post('/init', adminCheck, (req, res, next) => {
  meshInit().then(val => {
    if (val) {
      return res.json( new SuccessModel({'msg': 'successfully initialized the mesh', 'status': 202})
    )}
  })
});

module.exports = router;
