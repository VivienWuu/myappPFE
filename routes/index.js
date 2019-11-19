// 路由文件
var express = require('express');
var router = express.Router();

// 获取主页
router.get('/', function(req, res, next) {
  res.render('index',{});
});
router.get('/main',function (req,res,next) {
  res.render('main', { title: '管理系统' });
});
// 获取人员清单页面
router.get('/humanresource',function(req,res,next){
  res.render('hr',{ title: '管理系统' })
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
  res.render('project',{ title: '管理系统' })
});
// 项目清单页面：添加项目子页面
router.get('/IframeAddProject',function(req,res,next){ 
  res.render('iframes/addProject',{title:"/IframeAddProject"});
});
// 项目清单页面：修改项目子页面
router.get('/IframeChangeProject',function(req,res,next){
  res.render("iframes/changeProject",{title:'/IframeChangeProject'});
});
// 项目清单页面：查看修改计划工时页面
router.get('/IframeChangeHour',function(req,res,next) {
  res.render('iframes/changeHour',{title:'/IframeChangeHour'});
});

// 获取项目安排页面
router.get('/arrangement', function(req,res,next) {
  // 第一版
  // res.render('arrangement',{title:'管理系统'}); 
  // arrangementV2是第二版的项目安排页面
  res.render('arrangementV2',{title:'管理系统'}); 
});
// 项目安排页面：修改人员安排子页面
router.get('/IframeEditArrange',function(req,res,next) {
  res.render('iframes/editArrange',{title:'/IframeEditArrange'});
});


// 工卡统计页面
router.get('/jobcard',function(req,res,next) {
  res.render('jobcard',{title:'管理系统'})
});
// 获取计划总览页面
router.get('/hrChart',function(req,res,next){
  res.render('hrChart',{ title: '管理系统' })
});
module.exports = router;
