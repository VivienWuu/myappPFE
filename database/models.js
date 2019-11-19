// 声明MongoDB数据库中所有的collection以及对应的Schema
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/obv2hrsystem",{useNewUrlParser:true});

var staffSchema = new mongoose.Schema({
  idStaff:{type:String,unique:true,required:true},
  nameOfStaff:{type:String,required:true},
  groupOfStaff:{type:String},
  majorOfStaff:{type:String},
  postOfStaff:{type:String},
  hourOfStaff:{type:Number},
  statusOfStaff:[{_id:false,date:String,reason:String}],
  arrangementOfStaff:[{_id:false,projectId:String,date:Array}]
},{versionKey:false});

var projectSchema = new mongoose.Schema({
  nameOfProject:{type:String,required:true},
  startdateOfProject:{type:String,required:true},
  enddateOfProject:{type:String,required:true},
  hourOfProject:[{_id:false,avHour:Number,cbmeHour:Number,clstrHour:Number}],
  arrangementOfProject:[{_id:false,avListOfProject:Array,cbmeListOfProject:Array,clstrListOfProject:Array}]
},{versionKey:false});

var jobcardSchema = new mongoose.Schema({
  date:{type:String,required:true},
  avJobcardNumber:{type:Number,required:true},
  cbmeJobcardNumber:{type:Number,required:true},
  clstrJobcardNumber:{type:Number,required:true}
});

var staffmodel = mongoose.model('staffmodel',staffSchema,'STAFF');
var projectmodel = mongoose.model('projectmodel',projectSchema,'PROJECT');
var jobcardmodel = mongoose.model('jobcardmodel',jobcardSchema,'JOBCARD');

module.exports.staffmodel = staffmodel; 
module.exports.projectmodel = projectmodel;
module.exports.jobcardmodel = jobcardmodel;