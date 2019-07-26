// ROUTER：main.ejs
var express = require("express");
var router = express.Router();

var db = require("../database/models.js");

// FUNC : show all staff status  
// REQ : NUMBER the day shall be shown
// RES : ARRAY data to Echarts
router.get('/statusInDay',function(req,res,next) {
  db.staffmodel.find(function(err,documents) {
    if (err) return console.error(err);
    req.query.date = parseInt(req.query.date);
    res.json(statusOfStaffInDay(documents,req.query.date));
  })
});

// FUNC : transfer data to fullfill Echarts request
// INPUT : ARRAY documents from database 
//         NUMBER the day shall be shown
// OUTPUT : ARRAY data to Echarts
function statusOfStaffInDay(docsInDB,targetDate){
  var groupArray = ['组别','领班','排故工程师','ME/CB','AV','STR','工卡与计划室'];
  var statusArray = [groupArray,['在岗',0,0,0,0,0,0],['请假',0,0,0,0,0,0],['培训',0,0,0,0,0,0]];
  for (i=0;i<docsInDB.length;i++) {
    if (docsInDB[i].statusOfStaff.length == 0) { // no special status
      var groupOfthisStaff = groupArray.indexOf(docsInDB[i].groupOfStaff); // get group of this staff
      statusArray[1][groupOfthisStaff]  = statusArray[1][groupOfthisStaff] + 1; // add 1 staff 
    } else { // special status
      var isWork = 1;
      for (j=0;j<docsInDB[i].statusOfStaff.length;j++) {
        if (targetDate == docsInDB[i].statusOfStaff[j].date) { // if date in special status
          var groupOfthisStaff = groupArray.indexOf(docsInDB[i].groupOfStaff); // get group of staff
          if (docsInDB[i].statusOfStaff[j].reason == statusArray[2][0]) {
            statusArray[2][groupOfthisStaff]  = statusArray[2][groupOfthisStaff] + 1;
            isWork = 0;
          }else if (docsInDB[i].statusOfStaff[j].reason == statusArray[3][0]) {
            statusArray[3][groupOfthisStaff]  = statusArray[3][groupOfthisStaff] + 1;
            isWork = 0;
          };
          break;
        }
      }
      if (isWork == 1) {
        statusArray[1][groupOfthisStaff]  = statusArray[1][groupOfthisStaff] + 1;
      }
    }
  }
  return statusArray;
}

module.exports = router;