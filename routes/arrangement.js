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

router.get('/downloadStaffAvailable',function(req,res,next) {
  var threeGroupList = [];
  var staffAvailableList = [];
  db.projectmodel.findById(req.query._id,function(err,document) {
    var targetDate = moment(req.query.targetDate);
    var startdateOfProject = moment(document.startdateOfProject);
    indexOfDate = targetDate.diff(startdateOfProject,'days');
    threeGroupList.push(document.arrangementOfProject[indexOfDate].avListOfProject);
    threeGroupList.push(document.arrangementOfProject[indexOfDate].cbmeListOfProject);
    threeGroupList.push(document.arrangementOfProject[indexOfDate].clstrListOfProject);
    db.staffmodel.find({groupOfStaff:{$in:['领班','AV','CB/ME','CL/STR']}},function(err,documents) {
      documents.forEach(function (item) {
        var isStaffAvaible = 1;
        item.arrangementOfStaff.forEach(function (itemJ,index) {
          if (itemJ.date.indexOf(targetDate.format()) != -1) {
            isStaffAvaible = 0;
          }
        })
        if (isStaffAvaible) {
          staffAvailableList.push({
            idStaff:item.idStaff,
            nameOfStaff:item.nameOfStaff,
            hourOfStaff:item.hourOfStaff,
            groupOfStaff:item.groupOfStaff
          });
        }
      })
      res.json({threeGroupList:threeGroupList,staffAvailableList:staffAvailableList});
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
    var targetDate = moment(req.query.targetDate)
    var indexOfDate = targetDate.diff(moment(document.startdateOfProject),'days');
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
    db.staffmodel.find({idStaff:staffListToAdd},function(err,documents) {
      documents.forEach(function (item) { // for each staff to add arrangement
        if (item.arrangementOfStaff.length == 0) { // if he dont have any arrangement
          item.arrangementOfStaff.push({
            projectId :document._id,
            date: [targetDate.format()]
          });
        } else { // if he has arrangement: he should be check whether he has allready arranged in this project
          item.arrangementOfStaff.forEach(function(itemJ) {
            if (itemJ.projectId == document._id) { // if he has been arranged in this project, enlarge his date
              itemJ.date.push(targetDate.format());
            } else { // if he hasn't been arrangemented in this project, enlarge his arrangemnt list
              item.arrangementOfStaff.push({ 
                projectId:document._id,
                date:[targetDate.format()]
              })
            }
          })
        }
        item.save();
      });
    });
    db.staffmodel.find({idStaff:staffListToDelete},function(err,documents) {
      documents.forEach(function (item) {
        var indexDeleteProject = null;
        item.arrangementOfStaff.forEach(function(itemJ,index) {
          var indexDelete = itemJ.date.indexOf(req.query.targetDate);
          itemJ.date.splice(indexDelete,1);
          if (itemJ.date.length == 0) { // if this date is the last day in arrangement of this staff
            indexDeleteProject = index;
          }
        });
        item.arrangementOfStaff.splice(indexDeleteProject,1);
        item.save();
      })
    });
  });
  res.json({SUCCESS:1});
});

module.exports = router;