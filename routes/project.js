// 项目列表界面
var express = require("express");
var router = express.Router();

var db = require("../database/models.js");
var moment = require('moment');
moment.locale('zh-cn');
// FUNC : get all project without time requirement
// req : N/A
// res : LIST json oject of all project
router.get("/getAllProject",function(req,res,next) {
  db.projectmodel.find(function(err,documents){
    if (err) {
      console.error(err);
    } else {
      var projectList = [];
      documents.forEach(function (item,index){
        var projectObject = {
          _id:item._id,
          nameOfProject:item.nameOfProject,
          startdateOfProject: moment(item.startdateOfProject).format('YYYY-M-D'),
          enddateOfProject: moment(item.enddateOfProject).format('YYYY-M-D'),
        };
        projectList.push(projectObject);
      });
      res.json(projectList);
    }
  });
});

// FUNC : add a new object 
// req : JSON {nameOfProject:"",startdateOfProject:'1970-01-01',enddataOfProject:'1970-01-02',hour:[0,0,0,0]}
// res : JSON {SUCCESS:1/0}
router.get("/addOneProject",function(req,res,next) {
  var startdateOfProject = moment(req.query.startdateOfProject);
  var enddateOfProject = moment(req.query.enddateOfProject);
  req.query['arrangementOfProject'] = [];
  req.query['hourOfProject'] = [];
  for (var i=0;i<=enddateOfProject.diff(startdateOfProject,'days');i++) {
    req.query['arrangementOfProject'].push([]);
    req.query['hourOfProject'].push({'avHour':0,'cbmeHour':0,'clstrHour':0});
  }
  req.query['startdateOfProject'] = startdateOfProject.format();
  req.query['enddateOfProject'] = enddateOfProject.format();
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
  db.projectmodel.findById(req.query._id,function(err,document) {
    if (err) {
      res.json({SUCCESS:0});
    }
    var startdate = {
      new : moment(req.query.startdateOfProject),
      old : moment(document.startdateOfProject)
    };
    var enddate = {
      new : moment(req.query.enddateOfProject),
      old : moment(document.enddateOfProject)
    }
    var startDiff = startdate.new.diff(startdate.old,'days');
    var endDiff = enddate.new.diff(enddate.old,'days');
    if (startDiff<0) {
      for (var i=0;i<-startDiff;i++) {
        document['arrangementOfProject'].unshift([]);
        document['hourOfProject'].unshift({'avHour':0,'cbmeHour':0,'clstrHour':0});
      }
    } else if (startDiff>0) {
        document['arrangementOfProject'].splice(0,startDiff);
        document['hourOfProject'].splice(0,startDiff);
    }
    if (endDiff<0) {
      for (var i=0;i<-endDiff;i++) {
        document['arrangementOfProject'].pop();
        document['hourOfProject'].pop();
      }
    } else if (endDiff>0) {
      for (var i=0;i<endDiff;i++) {
        document['arrangementOfProject'].push([]);
        document['hourOfProject'].push({'avHour':0,'cbmeHour':0,'clstrHour':0});
      }
    }
    document['nameOfProject'] = req.query.nameOfProject;
    document['startdateOfProject'] = req.query.startdateOfProject;
    document['enddateOfProject'] = req.query.enddateOfProject;
    document.save();
    res.json({SUCCESS:1});
  });
});

// FUNC : delete a project
// REQ : STRING id of delete project
// RES : JSON {SUCCESS:1/0} 
router.get("/deleteOneProject",function(req,res,next) {
  db.projectmodel.findByIdAndRemove(req.query._id,function(err,document){
    // document is the project you want to delete
    db.staffmodel.find(function(err,result) {
      result.forEach(function(item,index){
        var indexOfDelete = null;
        item.arrangementOfStaff.forEach(function (itemJ,index) {
          if (itemJ.projectId == document._id) {
            indexOfDelete = index;
          }
        });
        if (indexOfDelete != null) {
          item.arrangementOfStaff.splice(indexOfDelete,1);
        }
        item.save();
      }); 
    });
    if (err) {
      res.json({SUCCESS:0});
    } else {
      res.json({SUCCESS:1});
    }
  });
});

router.get("/getOneProjectHour",function (req,res,next) {
  var oneProject = [];
  db.projectmodel.findById(req.query._id,function (err,document) {
    document.arrangementOfProject.forEach(function (item,i) {
      var totalHour = [0,0,0];
      item.avListOfProject.forEach(function (itemJ) {
        totalHour[0] = totalHour[0] + parseInt(itemJ.hourOfStaff);
      });
      item.cbmeListOfProject.forEach(function (itemJ) {
        totalHour[1] = totalHour[1] + parseInt(itemJ.hourOfStaff);
      });
      item.clstrListOfProject.forEach(function (itemJ) {
        totalHour[2] = totalHour[2] + parseInt(itemJ.hourOfStaff);
      });
      oneProject.push({
        hiddenIndex:i,
        dateInProject:moment(item.startdateOfProject).add(i,'days').format('YYYY-M-D'),
        avHour: document.hourOfProject[i].avHour,
        cbmeHour: document.hourOfProject[i].cbmeHour,
        clstrHour:document.hourOfProject[i].clstrHour,
        avTotalHour: totalHour[0],
        cbmeTotalHour: totalHour[1],
        clstrTotalHour:totalHour[2]
      });
    });
    console.log(oneProject);
    res.json({
      SUCCESS:1,
      oneProject:oneProject
    })
  });
});

router.get("/changeProjectHour",function(req,res,next) {
  db.projectmodel.findById(req.query._id, function (err,document) {
    req.query.oneProject.forEach(function (item,index) {
      console.log(item);
      document.hourOfProject[index].avHour = item.avHour;
      document.hourOfProject[index].cbmeHour = item.cbmeHour;
      document.hourOfProject[index].clstrHour = item.clstrHour;
    });
    document.save(function(err) {
      if(err) {
        res.json({SUCCESS:0});
      } else {
        res.json({SUCCESS:1});
      }
    });
  });
});

module.exports = router;