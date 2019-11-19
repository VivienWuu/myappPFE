// 工卡统计界面
var express = require('express');
var router = express.Router();
var db = require('../database/models');
var moment = require('moment');

router.get('/addJobcardInDay',function(req,res,next) {
  var jobcardDate = moment(req.query.jobcardDate);
  db.jobcardmodel.findOne({date:jobcardDate},function (err,document) {
    if (!document) {
      var newRecord = new db.jobcardmodel({
        date:jobcardDate,
        avJobcardNumber:req.query.avJobcardNumber,
        cbmeJobcardNumber:req.query.cbmeJobcardNumber,
        clstrJobcardNumber:req.query.clstrJobcardNumber
      });
      newRecord.save();
      res.json({SUCCESS:1});
    } else {
      document['avJobcardNumber'] = req.query.avJobcardNumber;
      document['cbmeJobcardNumber'] = req.query.cbmeJobcardNumber;
      document['clstrJobcardNumber'] = req.query.clstrJobcardNumber;
      document.save();
      res.json({SUCCESS:2});
    }
  });
});

module.exports = router;