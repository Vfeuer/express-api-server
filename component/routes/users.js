var express = require('express');
var router = express.Router();
const { SuccessModel, ErrorModel } = require('../model/resModel')
const {login, changePWD, addUser} = require('../controller/userControl')
const adminCheck = require('../midware/adminCheck');

// log in 
router.post('/login', (req, res, next) => {
  const { username, password } = req.body
  const result = login(username, password)
  return result.then(data => {
    if (data.username) {
      req.session.username = data.username
      return res.json(new SuccessModel(meta={'msg': 'login successful', 'status': 200}, data)
    )}
    return res.json(new ErrorModel(meta={'msg': 'wrong password or username', 'status': 400})
    )
  })
});

/* change the password */
router.post('/password', (req, res, next) => {
  const {username, password, newPassword} = req.body
  const checkresult = login(username, password)
  checkresult.then( data => {
    if(!data.username) {
      return res.json(new ErrorModel(meta= {'msg':'wrong user info', 'status': 422})
      )}
    const result = changePWD(username, newPassword)
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

/* Add the new user with lower authority */
router.post('/addUser', adminCheck, (req, res, next) => {
  const { subUsername, subPassword } = req.body
  const result = addUser(subUsername, subPassword)
  return result.then(val => {
    if (val) {
      return res.json( new SuccessModel(meta={'msg': 'successfully added the new user', 'status': 202})
    )}
    return res.json(
      new ErrorModel(meta= {'msg': 'Failed to add the new user',
                            'status': 500})
    )
  })
});

module.exports = router;
