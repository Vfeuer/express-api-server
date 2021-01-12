var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require("../model/resModel")
const { getMeshSetting, changeMeshSetting } = require('../controller/meshControl')
const loginCheck = require('../midware/loginCheck')
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
router.post('/setting', (req, res, next) => {
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

module.exports = router;
