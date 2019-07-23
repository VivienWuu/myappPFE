// 请求路由：人员清单
var express = require("express");
var router = express.Router();

var db = require("../database/models.js");// 声明mongoDB数据库的变量
var date = new Date();
var today = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

// 获取所有人员数据
router.get("/getAllStaff",function (req,res,next) {
  db.staffmodel.find(function(err,documents){
    if(err) return console.error(err);
    res.json(format(documents,today));
  })
});

// 增加一名新人员
router.get('/addOneStaff',function(req,res,next) {
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result){
    if(result){
      res.json({SUCCESS:0});
    }else {
      var oneStaff = {
        "idStaff":req.query.idStaff,
        "nameOfStaff":req.query.nameOfStaff,
        "majorOfStaff":req.query.majorOfStaff,
        "postOfStaff":req.query.postOfStaff,
        "groupOfStaff":req.query.groupOfStaff,
        "statusOfStaff":[]
      };
      var newStaff = db.staffmodel(oneStaff);
      newStaff.save(function(err){
        if (err) return console.error(err);
      });
      res.json({SUCCESS:1});
    }
  })
});
// 改变人员属性
router.get('/changeStaffValue',function(req,res,next){
  db.staffmodel.updateOne({idStaff:req.query.idStaff},req.query,function(err,result){
    if(err){
      res.json({SUCCESS:0});
    }else{
      res.json({SUCCESS:1});
    }
  });
});

// 改变人员的状态
router.get('/changeStaffStatus',function(req,res,next){
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result){
    req.query.date = parseInt(req.query.date);
    if (result && result.statusOfStaff !=[] && req.query.reason == "在岗") {
      var indexList = -1;
      for (i=0;i<result.statusOfStaff.length;i++) {
        if(req.query.date == result.statusOfStaff[i].date){
          indexList = i;
          break;
        }
      }
      if(indexList !=-1) {
        result.statusOfStaff.splice(indexList,1);
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
        if(req.query.date == result.statusOfStaff[i].date){
          indexList = i;
        }
      }
      if (indexList !=-1) {
        result.statusOfStaff.splice(indexList,1);
        result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      }else {
        result.statusOfStaff.push({date:req.query.date,reason:req.query.reason});
      }
      result.save();
      res.json({SUCCESS:1});
    }else {
      res.json({SUCCESS:0});
    }
  });
});

// 搜索人员的状态
router.get('/searchStaffStatus',function(req,res,next){
  db.staffmodel.findOne({idStaff:req.query.idStaff},function(err,result){
    if(result){
      res.json(result.statusOfStaff);  
    }else {
      res.json({SUCCESS:0});
    }    
  });
});

// 删除一名人员
router.get('/deleteOneStaff',function(req,res,next){
  db.staffmodel.findOneAndDelete({idStaff:req.query.idStaff},function(err,result){
    if(result){
      res.json({SUCCESS:1});
    }else {
      res.json({SUCCESS:0});
    }
  });
});

// 数据前后端格式化：搜索到的数据库数据-> 前端使用的数据
// docsInDB list 数据库数据集合
// dateCompare Int 进行对比的日期
function format(docsInDB,targetDate) {
  var docsInWeb = docsInDB;
  for(i=0;i<docsInDB.length;i++){
    if(docsInDB[i].statusOfStaff.length == 0){
      docsInWeb[i].statusOfStaff = "在岗";
    }else {
      docsInWeb[i].statusOfStaff = "在岗"
      for(j=0;j<docsInDB[i].statusOfStaff.length;j++){
        if(targetDate == docsInDB[i].statusOfStaff[j].date){
          docsInWeb[i].statusOfStaff = docsInDB[i].statusOfStaff[j].reason;
        }
      }
    }
  }
  return docsInWeb;
}

module.exports = router;