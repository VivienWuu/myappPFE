var express = require('express');
var router = express.Router();

// 获取主页
router.get('/', function(req, res, next) {
  res.render('main', { title: 'OBV2人力资源管理系统' });
});
// 获取人员清单页面
router.get('/humanresource',function(req,res,next){
  res.render('hr',{ title: 'OBV2人力资源管理系统' })
});
// 人员清单页面：添加人员子页面
router.get('/IframeAddStaff',function(req,res,next){ 
  res.render('iframes/addstaff',{title:"/IframeAddStaff"});
});
// 人员清单页面：编辑人员信息子页面
router.get('/IframeChangeStaffValue',function(req,res,next){
  res.render('iframes/changestaffvalue',{title:"/IframeChangeStaffValue"});
});
// 人员清单页面：编辑人员状态子页面
router.get('/IframeChangeStaffStatus',function(req,res,next){
  res.render('iframes/changestaffstatus',{title:"/IframeChangeStaffStatus"});
});

// 获取项目清单页面
router.get('/project',function(req,res,next){
  res.render('project',{ title: 'OBV2人力资源管理系统' })
});
// 项目清单页面：添加项目子页面
router.get('/IframeAddProject',function(req,res,next){ 
  res.render('iframes/addProject',{title:"/IframeAddProject"});
});
// 项目清单页面：修改项目子页面
router.get('/IframeChangeProject',function(req,res,next){
  res.render("iframes/changeProject",{title:'/IframeChangeProject'});
});
// 获取计划总览页面
router.get('/hrChart',function(req,res,next){
  res.render('hrChart',{ title: 'OBV2人力资源管理系统' })
});
module.exports = router;
