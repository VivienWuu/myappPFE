// ROUTER：main.ejs
var express = require("express");
var router = express.Router();
var db = require('../database/models');
var moment = require('moment');
// V1 REQUEST
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

// V2 REQUEST
router.get('/getAllProjectInfo',function(req,res,next) {
  var targetMonth = [req.query.date + '-01',""];
  if (["1","3","5","7","8","10","12"].indexOf(req.query.date.substr(-2)) != -1) {
    targetMonth[1] = req.query.date + "-31";
  } else if (["4","6","9","11"].indexOf(req.query.date.substr(-2)) != -1) {
    targetMonth[1] = req.query.date + "-30";
  } else if (req.query.date.substr(0,4)%4 != 0 ) {
    targetMonth[1] = req.query.date + "-28";
  } else {
    targetMonth[1] = req.query.date + "-29";
  }
  console.log(targetMonth);
  var listOfProject = [];
  db.projectmodel.find(function(err,documents) {
    documents.forEach(function(item,index) { // check project period
      var differenceOfTwoPeriod = [
        moment(item.startdateOfProject).diff(targetMonth[1],'days'), // 开始日期与目标月份最后一天的差值，>0说明不在范围内
        moment(item.enddateOfProject).diff(targetMonth[0],'days') // 结束日期与月份第一天的差值，<0说明不在范围内
      ];
      if (!(differenceOfTwoPeriod[0]>0 || differenceOfTwoPeriod[1]<0)) {
        listOfProject.push(item);
      }   
    })
    res.json({listOfProject:listOfProject});
  });
});

router.get('/getAllStaffAvailable',function (req,res,next) {
  db.staffmodel.find({groupOfStaff:{$in:['领班','AV','CB/ME','CL/STR']}},function(err,documents) {
    res.json(documents);
  })
});
router.get('/arrangeOneProject',function (req,res,next) { 
  console.log(req.query);
  db.projectmodel.findById(req.query._id,function (err,document) {
    // 确定具体要修改的日期
    var arrangeStartDate = moment(req.query.truePeriod[0]).diff(moment(document.startdateOfProject),'days');
    var arrangeEndDate = moment(req.query.truePeriod[1]).diff(moment(document.startdateOfProject),'days');
    for (var i=arrangeStartDate;i<arrangeEndDate+1;i++) {
      var insertList = [[],[],[]];
      if (req.query.staffList == undefined) {
        req.query.staffList = [];
      }
      req.query.staffList.forEach(function (item) {
        if (item.groupOfStaff == 'AV' || (item.groupOfStaff == '领班' && item.majorOfStaff == 'AV')) {
          insertList[0].push(item);
        } else if (item.groupOfStaff == 'CB/ME' || (item.groupOfStaff == '领班' && item.majorOfStaff == 'ME')) {
          insertList[1].push(item);
        } else if (item.groupOfStaff == 'CL/STR' || (item.groupOfStaff == '领班' && item.majorOfStaff == 'STR')) {
          insertList[2].push(item);
        }   
      });
      document.arrangementOfProject[i].avListOfProject = insertList[0];
      document.arrangementOfProject[i].cbmeListOfProject = insertList[1];
      document.arrangementOfProject[i].clstrListOfProject = insertList[2];
    }
    document.save();
    res.json({SUCCESS:1});
  });
});
module.exports = router;