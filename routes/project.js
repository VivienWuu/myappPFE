// ROUTER : project.ejs
var express = require("express");
var router = express.Router();

var db = require("../database/models.js");

// FUNC : get all project without time requirement
// req : N/A
// res : LIST json oject of all project
router.get("/getAllProject",function(req,res,next) {
  db.projectmodel.find(function(err,documents){
    if (err) {
      console.error(err);
    } else {
      var projectList = [];
      for (var i=0;i<documents.length;i++) {
        var projectObject = {
          _id:documents[i]._id,
          nameOfProject:documents[i].nameOfProject,
          startdateOfProject: documents[i].startdateOfProject.toLocaleDateString(),
          enddateOfProject: documents[i].enddateOfProject.toLocaleDateString(),
          hourOfProject:documents[i].hourOfProject
        };
        projectList.push(projectObject);
      }
      res.json(projectList);
    }
  });
});

// FUNC : add a new object 
// req : JSON {nameOfProject:"",startdateOfProject:19700101,enddataOfProject:20190102,hour:[0,0,0,0]}
// res : JSON {SUCCESS:1/0}
router.get("/addOneProject",function(req,res,next) {
  for (var i=0;i<req.query.hourOfProject.length;i++) {
    req.query.hourOfProject[i] = parseInt(req.query.hourOfProject[i]);
  }
  var newProject = new db.projectmodel(req.query);
  newProject.save(function(err) {
    if (err) {
      res.json({SUCCESS:0});
    } else {
      res.json({SUCCESS:1});
    }
  });
});

router.get('/changeProjectValue',function(req,res,next) {
  var projectObject = {
    _id:req.query._id,
    nameOfProject: req.query.nameOfProject,
    startdateOfProject:req.query.startdateOfProject,
    enddateOfProject : req.query.enddateOfProject,
    hourOfProject:[parseInt(req.query.hourAV),parseInt(req.query.hourCBME),parseInt(req.query.hourCLSTR)]
  }
  db.projectmodel.updateOne({_id:projectObject._id},projectObject,function(err){
    if (err) {
      res.json({SUCCESS:0});
    } else {
      res.json({SUCCESS:1});
    }
  });
});

// FUNC : delete a project
// REQ : STRING id of delete project
// RES : JSON {SUCCESS:1/0} 
router.get("/deleteOneProject",function(req,res,next) {
  db.projectmodel.findByIdAndRemove(req.query._id,function(err,documents){
    if (err) {
      res.json({SUCCESS:0});
    } else {
      res.json({SUCCESS:1});
    }
  });
});

module.exports = router;