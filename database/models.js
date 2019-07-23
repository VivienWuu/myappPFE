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
  
});

var projectmodel = mongoose.model('projectmodel',projectSchema,'PROJECT');
var staffmodel = mongoose.model('staffmodel',staffSchema,'STAFF');

module.exports.staffmodel = staffmodel; 
module.exports.projectmodel = projectmodel;