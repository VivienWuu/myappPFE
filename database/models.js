// 声明MongoDB数据库中所有的collection以及对应的Schema
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost:27017/obv2hrsystem",{useNewUrlParser:true});

var staffSchema = new mongoose.Schema({
  idStaff:{type:String,unique:true,required:true},
  nameOfStaff:{type:String,required:true},
  groupOfStaff:{type:String},
  majorOfStaff:{type:String},
  postOfStaff:{type:String},
  statusOfStaff:{type:Array}
},{versionKey:false});

var projectSchema = new mongoose.Schema({
  nameOfProject:{type:String,required:true},
  startdateOfProject:{type:Number,required:true},
  enddateOfProject:{type:Number,required:true},
  hourOfProjct:{type:Array}
},{versionKey:false});

var staffmodel = mongoose.model('staffmodel',staffSchema,'STAFF');
var projectmodel = mongoose.model('projectmodel',projectSchema,'PROJECT');

module.exports.staffmodel = staffmodel; 
module.exports.projectmodel = projectmodel;