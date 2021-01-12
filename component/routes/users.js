var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {login, changePWD} = require('../controller/userControl')
const loginCheck = require('../midware/loginCheck')

// log in 
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const result = login(username, password)
  return result.then(data => {
    if (data.username) {
      return res.json(new SuccessModel(meta={'msg': 'login successful', 'status': 200}, data)
    )}
    return res.json(new ErrorModel(meta={'msg': 'wrong password or username', 'status': 400})
    )
  })
});

/* change the password */
router.post('/password', (req, res, next) => {
  const {username, password, newpassword} = req.body
  const checkresult = login(username, password)
  checkresult.then( data => {
    if(!data.username) {
      return res.json(new ErrorModel(meta= {'msg':'wrong user info', 'status': 422})
      )}
    const result = changePWD(username, newpassword)
    return result.then(val => {
      if (val) {
        return res.json( new SuccessModel(meta={'msg': 'successfully change password', 'status': 202})
      )}
      return res.json(
        new ErrorModel(meta= {'msg': 'Failed to change the password',
                              'status': 500})
      )
  })
  })
});

module.exports = router;
