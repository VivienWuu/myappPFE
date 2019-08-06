// ROUTER：main.ejs
var express = require("express");
var router = express.Router();
var db = require('../database/models');

router.get('/',function(req,res,next) {
  res.render('arrangement2',{title:'OBV2人力资源管理系统'});
});

router.get('/getProjectInfo',function(req,res,next) {
  db.projectmodel.findById(req.query._id,function(err,document){
    var projectObject = {
      _id : document._id,
      nameOfProject : document.nameOfProject,
      startdateOfProject : document.startdateOfProject.toLocaleDateString(),
      enddateOfProject : document.enddateOfProject.toLocaleDateString() 
    }
    res.json(projectObject);
  });
});

router.get('/getProjectArrangement',function(req,res,next) {
  db.projectmodel.findById(req.query._id,function(err,document) {
    
  });
});

module.exports = router;