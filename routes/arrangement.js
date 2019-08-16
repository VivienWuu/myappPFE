// ROUTER：main.ejs
var express = require("express");
var router = express.Router();
var db = require('../database/models');
var moment = require('moment');
router.get('/',function(req,res,next) {
  res.render('arrangement2',{title:'OBV2人力资源管理系统'});
});

router.get('/getProjectInfo',function(req,res,next) {
  db.projectmodel.findById(req.query._id,function(err,document){
    var projectObject = {
      _id : document._id,
      nameOfProject : document.nameOfProject,
      startdateOfProject : moment(document.startdateOfProject).format("YYYY-M-D"),
      enddateOfProject : moment(document.enddateOfProject).format("YYYY-M-D") 
    }
    res.json(projectObject);
  });
});

router.get('/downloadStaffAvailble',function(req,res,next) {
  var threeGroupList = [];
  var staffAvailbleList = [];
  db.projectmodel.findById(req.query._id,function(err,document) {
    var targetDate = moment(req.query.targetDate);
    var startdateOfProject = moment(document.startdateOfProject);
    indexOfDate = targetDate.diff(startdateOfProject,'days');
    threeGroupList.push(document.arrangementOfProject[indexOfDate].avListOfProject);
    threeGroupList.push(document.arrangementOfProject[indexOfDate].cbmeListOfProject);
    threeGroupList.push(document.arrangementOfProject[indexOfDate].clstrListOfProject);
    db.staffmodel.find({groupOfStaff:{$in:['领班','AV','CB/ME','CL/STR']}},function(err,documents) {
      for (i=0;i<documents.length;i++) {
        if (documents[i].statusOfStaff.length == 0) { // no special status
          staffAvailbleList.push({
            idStaff:documents[i].idStaff,
            nameOfStaff:documents[i].nameOfStaff,
            groupOfStaff: documents[i].groupOfStaff            
          });
        } else { // special status
          var isAvailble = 1;
          for (j=0;j<documents[i].statusOfStaff.length;j++) {
            if (req.query.targetDate == documents[i].statusOfStaff[j].date) { // if date in special status
              isAvailble = 0;
              break;
            }
          }
          if (isAvailble == 1) {
            staffAvailbleList.push({
              idStaff:documents[i].idStaff,
              nameOfStaff:documents[i].nameOfStaff,
              groupOfStaff: documents[i].groupOfStaff
            });
          }
        }
      }
      res.json({threeGroupList:threeGroupList,staffAvailbleList:staffAvailbleList});
    });
  });
});

router.get('/uploadStaffArrangement',function(req,res,next) {
  ['avListOfProject','cbmeListOfProject','clstrListOfProject'].forEach(function(item) { // jQajax can't transfer []
    if (req.query.arrangementInDay[item] == undefined) {
      req.query.arrangementInDay[item] = []
    }
  });
  db.projectmodel.findById(req.query._id,function(err,document) {
    var indexOfDate = moment(req.query.targetDate).diff(moment(document.startdateOfProject),'days');
    
    var staffListChanged = [];
    document.arrangementOfProject[indexOfDate].avListOfProject.forEach(function(item) {
      staffListChanged.push(item.idStaff);
    });
    document.arrangementOfProject[indexOfDate].cbmeListOfProject.forEach(function(item) {
      staffListChanged.push(item.idStaff);
    });
    document.arrangementOfProject[indexOfDate].clstrListOfProject.forEach(function(item) {
      staffListChanged.push(item.idStaff);
    });
    
    document.arrangementOfProject[indexOfDate] = req.query.arrangementInDay;
    document.save();
    
    
    var staffListToChange = [];
    document.arrangementOfProject[indexOfDate].avListOfProject.forEach(function(item) {
      staffListToChange.push(item.idStaff);
    });
    document.arrangementOfProject[indexOfDate].cbmeListOfProject.forEach(function(item) {
      staffListToChange.push(item.idStaff);
    });
    document.arrangementOfProject[indexOfDate].clstrListOfProject.forEach(function(item) {
      staffListToChange.push(item.idStaff);
    });

    var staffListcommon = staffListToChange.filter(function(item) {
      return staffListChanged.indexOf(item) !== -1;
    });
    var staffListToAdd = staffListToChange.filter(function(item) {
      return staffListcommon.indexOf(item) === -1;
    })
    var staffListToDelete = staffListChanged.filter(function(item) {
      return staffListcommon.indexOf(item) === -1;
    });
    console.log(staffListcommon);
    console.log('ADD: ' + staffListToAdd);
    console.log('DEL: ' + staffListToDelete);
    db.staffmodel.find({idStaff:staffListToAdd},function(err,documents) {
      documents.forEach(function(item) {
        item.statusOfStaff.push({
          date:req.query.targetDate,
          reason:document.nameOfProject
        });
        item.save();
      });
    });
    db.staffmodel.find({idStaff:staffListToDelete},function(err,documents) {
      documents.forEach(function(itemStaff) {
        var newStatus = itemStaff.statusOfStaff.filter(function(index){
          return index.date !== req.query.targetDate;
        })
        console.log('itemStaff: ' + itemStaff);
        console.log('newStatus: ' + newStatus);
        itemStaff.statusOfStaff = newStatus;
        itemStaff.save();
      });
    });
  });
  res.json({SUCCESS:1});
});

module.exports = router;