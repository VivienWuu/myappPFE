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

router.get('/getStaffAvailble',function(req,res,next) {
  var threeGroupList = [];
  var staffAvailbleList = [];
  db.projectmodel.findById(req.query._id,function(err,document) {
    threeGroupList[0] = document.avListOfProject;
    threeGroupList[1] = document.cbmeListOfProject;
    threeGroupList[2] = document.clstrListOfProject;
    db.staffmodel.find({groupOfStaff:{$in:['领班','AV','CB/ME','CL/STR']}},function(err,documents) {
      console.log(documents);
      for (i=0;i<documents.length;i++) {
        if (documents[i].statusOfStaff.length == 0) { // no special status
          staffAvailbleList.push({
            idStaff:documents[i].idStaff,
            nameOfStaff:documents[i].nameOfStaff,
            groupOfStaff: documents[i].groupOfStaff            
          });
        } else { // special status
          var isAvailble = 1;
          for (j=0;j<docsInDB[i].statusOfStaff.length;j++) {
            if (req.query.targetDate == docsInDB[i].statusOfStaff[j].date.toLocaleDateString()) { // if date in special status
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
            break;
          }
        }
      }
      res.json({threeGroupList:threeGroupList,staffAvailbleList:staffAvailbleList});
    });
  });
});
module.exports = router;