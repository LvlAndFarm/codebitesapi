var express = require('express');
var router = express.Router();

var jwtVerify = require('./common/jwt')

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/me', jwtVerify, function(req, res, next) {
  res.json(req.user);
});



module.exports = router;
