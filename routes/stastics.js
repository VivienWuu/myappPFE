// 请求路由：数据统计
var express = require("express");
var router = express.Router();

var db = require("../database/models.js");// 声明mongoDB数据库的变量

router.get('/statusInDay',function(req,res,next){
  db.staffmodel.find(function(err,documents){
    if(err) return console.error(err);
    console.log(req.query.date);
    res.json(statusOfStaffInDay(documents,req.query.date));
  })
});

// 统计特定日期的员工状态
function statusOfStaffInDay(docsInDB,targetDate){
  var groupArray =['组别','领班','排故工程师','ME/CB','AV','STR','工卡与计划室'];
  var statusArray = [groupArray,['在岗',0,0,0,0,0,0],['请假',0,0,0,0,0,0],['培训',0,0,0,0,0,0]];
  for(i=0;i<docsInDB.length;i++){
    if(docsInDB[i].statusOfStaff.length == 0){ // 无特殊状态
      var groupOfthisStaff = groupArray.indexOf(docsInDB[i].groupOfStaff); // 确定该人员组别在groupArray中的位置
      statusArray[1][groupOfthisStaff]  = statusArray[1][groupOfthisStaff] + 1;
    }else { // 有特殊状态
      var isWork = 1;
      for(j=0;j<docsInDB[i].statusOfStaff.length;j++){
        if(targetDate == docsInDB[i].statusOfStaff[j].date){ // 判断日期与状态
          var groupOfthisStaff = groupArray.indexOf(docsInDB[i].groupOfStaff); // 确定该人员组别在groupArray中的位置
          if (docsInDB[i].statusOfStaff[j].reason == statusArray[2][0]){
            statusArray[2][groupOfthisStaff]  = statusArray[2][groupOfthisStaff] + 1;
            isWork = 0;
          }else if(docsInDB[i].statusOfStaff[j].reason == statusArray[3][0]){
            statusArray[3][groupOfthisStaff]  = statusArray[3][groupOfthisStaff] + 1;
            isWork = 0;
          };
          break;
        }
      }
      if(isWork == 1){
        statusArray[1][groupOfthisStaff]  = statusArray[1][groupOfthisStaff] + 1;
      }
    }
  }
  return statusArray;
}
module.exports = router;