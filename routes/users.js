// 登录界面 未完成 TODO: 在需要多用户操作时完成 
var express = require('express');
var router = express.Router();
  
router.post('/login',function(req,res,next) {
  console.log("用户名: " + req.body.username);
  console.log("密码: " + req.body.password);
  res.redirect("/main");
});

router.post('/logup',function(req,res,next) {

});

router.post('/logout',function(req,res,next) {

});
module.exports = router;
