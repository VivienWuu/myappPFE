// ROUTER : hr.ejs
var express = require("express");
var router = express.Router();

var db = require("../database/models");

// VARIABLE : today 
var today = new Date();

// FUNC : get all staff information of today
// REQ : N/A
// RES : LIST json object of all staff info in today 
router.get("/getAllStaff",function (req,res,next) {
  db.staffmodel.find(function(err,documents) {
    if (err) return console.error(err);
    res.json(format(documents,today));  
  })
});

// FUNC : add a new staff in database
// REQ : JSON {idStaff,nameOfStaff,postOfStaff,groupOfStaff,majorOfStaff}
// RES : JSON {SUCCESS:1/0} add success or fail
router.get('/addOneStaff',function(req,res,next) {
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result) {
    if (err) return console.error(err);
    if (result) {
      res.json({SUCCESS:0});
    } else {
      req.query["statusOfStaff"] = [];
      var newStaff = db.staffmodel(req.query);
      newStaff.save(function(err) {
        if (err) return console.error(err);
      });
      res.json({SUCCESS:1});
    }
  });
});

// FUNC : change one staff attributes
// REQ : JSON {idStaff,nameOfStaff,postOfStaff,groupOfStaff,majorOfStaff}
// RES : ISON {SUCCESS:1/0} change success or fail
router.get('/changeStaffValue',function(req,res,next) {
  db.staffmodel.updateOne({idStaff:req.query.idStaff},req.query,function(err,result) {
    if (err) {
      res.json({SUCCESS:0});
    } else {
      res.json({SUCCESS:1});
    }
  });
});

// FUNC : change one staff status of one day
// REQ : JSON {idStaff,date,reason}
// RES : JSON {SUCCESS:1/0/-1} add a special status or change status fail or delete a special status
router.get('/changeStaffStatus',function(req,res,next) {
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result) {
    if (result && result.statusOfStaff !=[] && req.query.reason == "在岗") { 
      var indexList = -1;
      for (i=0;i<result.statusOfStaff.length;i++) {
        var browserList = req.query.date.split("/");
        var databaseList = result.statusOfStaff[i].date.toLocaleDateString().split("-");
        if(browserList[0]==databaseList[0] && browserList[1]==databaseList[1] && browserList[2]==databaseList[2]){
          indexList = i;
          result.statusOfStaff.splice(indexList,1);
          break;
        }
      }
      result.save();
      res.json({SUCCESS:-1});
    }else if (result && result.statusOfStaff ==[] && req.query.reason == "在岗") {
      res.json({SUCCESS:0});
    }else if (result && result.statusOfStaff ==[] && req.query.reason != "在岗") {
      result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      result.save();
      res.json({SUCCESS:1});
    }else if (result && result.statusOfStaff !=[] && req.query.reason != "在岗") {
      var indexList = -1;
      for (i=0;i<result.statusOfStaff.length;i++) {
        var browserList = req.query.date.split("/");
        var databaseList = result.statusOfStaff[i].date.toLocaleDateString().split("-");
        if(browserList[0]==databaseList[0] && browserList[1]==databaseList[1] && browserList[2]==databaseList[2]){
          indexList = i;
          result.statusOfStaff.splice(indexList,1);
          result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
          break;
        }
      }
      if (indexList == -1) {
        result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      }
      result.save();
      res.json({SUCCESS:1});
    }else {
      res.json({SUCCESS:0});
    }
  });
});

// FUNC : search one staff 's staff used in laydate
// REQ : JSON {idStaff}
// RES : ARRAY statusOfStaff or JSON {SUCCESS:0}
router.get('/searchStaffStatus',function(req,res,next) {
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result) {
    if (result) {
      var statusList = [];
      for (var i=0;i<result.statusOfStaff.length;i++) {
        statusList.push({date:result.statusOfStaff[i].date.toLocaleDateString(),reason:result.statusOfStaff[i].reason});
      }
      res.json(statusList);  
    } else {
      res.json({SUCCESS:0});
    }    
  });
});

// FUNC : delete a staff 
// REQ : JSON {idStaff}
// RES : JSON {SUCCESS:1/0} delete success or fail
router.get('/deleteOneStaff',function(req,res,next) {
  db.staffmodel.findOneAndDelete({idStaff:req.query.idStaff},function(err,result) {
    if (result) {
      res.json({SUCCESS:1});
    } else {
      res.json({SUCCESS:0});
    }
  });
});

// FUNC : transfer docs in database to front-end  
// INPUT : ARRAY documents searched from database 
//         NUMBER target date to transfer format  
// OUTPUT : 
function format(docsInDB,targetDate) { 
  var docsInWeb = [];
  if (docsInDB.length) {
    for (var i=0;i<docsInDB.length;i++) {
      var objectStaff =  {
        idStaff : docsInDB[i].idStaff,
        nameOfStaff : docsInDB[i].nameOfStaff,
        postOfStaff : docsInDB[i].postOfStaff,
        groupOfStaff : docsInDB[i].groupOfStaff,
        majorOfStaff : docsInDB[i].majorOfStaff,
        statusOfStaff:'在岗'
      }
      if (docsInDB[i].statusOfStaff.length) {
        for (j=0;j<docsInDB[i].statusOfStaff.length;j++) {
          if (targetDate.toLocaleDateString() == docsInDB[i].statusOfStaff[j].date.toLocaleDateString()) {
            objectStaff.statusOfStaff = docsInDB[i].statusOfStaff[j].reason;
            break;
          }
        }
      }
      docsInWeb.push(objectStaff);
    }
  }
  return docsInWeb;
}

module.exports = router;