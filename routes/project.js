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
      res.json(documents);
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
  db.projectmodel.findByIdAndUpdate(req.query._id,req.query,function(err){
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
      res.json({SUCCESS:1,doc:documents});
    }
  });
});

module.exports = router;