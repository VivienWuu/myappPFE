// ROUTER : hr.ejs
var express = require("express");
var router = express.Router();
var db = require("../database/models");
var moment = require('moment');
// VARIABLE : today 
var today = moment().startOf('Day');

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
    if (result && result.statusOfStaff ==[] && req.query.reason == "在岗") {
      res.json({SUCCESS:0});
    } else if (result && result.statusOfStaff ==[] && req.query.reason != "在岗") {
      result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      result.save();
      res.json({SUCCESS:1});
    } else if (result && result.statusOfStaff !=[] && req.query.reason == "在岗") {
      result.statusOfStaff.forEach(function(item,index) {
        var dateFromWeb = req.query.date;
        var dateFromDatabase = item.date;
        if(dateFromWeb == dateFromDatabase){
          result.statusOfStaff.splice(index,1);
        }
      }); 
      result.save();
      res.json({SUCCESS:-1});
    } else if (result && result.statusOfStaff !=[] && req.query.reason != "在岗") {
      var indexList = -1;
      result.statusOfStaff.forEach(function (item,index) {
        var DateFromWeb = req.query.date;
        var dateFromDatabase = item.date;
        if(DateFromWeb == dateFromDatabase){
          indexList = i;
          result.statusOfStaff.splice(index,1);
          result.statusOfStaff.push({date:item.date,reason:item.reason});
        }
      });
      if (indexList == -1) {
        result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      }
      result.save();
      res.json({SUCCESS:1});
    } else {
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
        statusList.push({date:result.statusOfStaff[i].date,reason:result.statusOfStaff[i].reason});
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
    // result is the object you want to delete
    console.log(result);
    if (result) {
      result.arrangementOfStaff.forEach(function (item) {
        db.projectmodel.findById(item.projectId,function(err,document) {
          document.arrangementOfProject.forEach(function (itemJ) {
            var indexToDelete = null;
            itemJ['avListOfProject'].forEach(function (itemK,index) {
              if (itemK.idStaff == result.idStaff) {
                indexToDelete = index;
              }
            });
            if (indexToDelete != null) {
              itemJ['avListOfProject'].splice(indexToDelete,1);
            }
            var indexToDelete = null;
            itemJ['cbmeListOfProject'].forEach(function (itemK,index) {
              if (itemK.idStaff == result.idStaff) {
                indexToDelete = index;
              }
            });
            if (indexToDelete != null) {
              itemJ['cbmeListOfProject'].splice(indexToDelete,1);
            }
            var indexToDelete = null;
            itemJ['clstrListOfProject'].forEach(function (itemK,index) {
              if (itemK.idStaff == result.idStaff) {
                indexToDelete = index;
              }
            });
            if (indexToDelete != null ) {
              itemJ['clstrListOfProject'].splice(indexToDelete,1);
            }
          });
          document.save();
        })
      });
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
    docsInDB.forEach(function(item) {
        var objectStaff =  {
          _id : item._id,
          idStaff : item.idStaff,
          nameOfStaff : item.nameOfStaff,
          postOfStaff : item.postOfStaff,
          groupOfStaff : item.groupOfStaff,
          majorOfStaff : item.majorOfStaff,
          hourOfStaff : item.hourOfStaff,
          statusOfStaff:'在岗'
        }
        if (item.statusOfStaff.length) {
          item.statusOfStaff.forEach(function (statusItem) {
            if (targetDate == statusItem.date) {
              objectStaff.statusOfStaff = statusItem.reason;
            }
          });
        }
        docsInWeb.push(objectStaff);
    });
  }
  return docsInWeb;
}

module.exports = router;