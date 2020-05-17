// 危险化学品重大危险源分级
var mongoose = require('mongoose')
var MajorLevelSchema = mongoose.Schema({
	major_isRisk:{type:Boolean,required:false}, //是否重大危险源
	major_unitId:{type:Number,required:true}, //单元ID
  major_unit:{type:String,required:true}, //单元名
  major_S:{type:Number,required:true}, //辨识依据
	major_α:{type:Number,required:true},// α校正系数
	major_β:{type:Number,required:true},  //β校正系数
	major_R:{type:Number,required:true}, //R校正系数
	major_level:{type:Number,required:true}, //级别
  
	
});

//把这个 schema 编译成一个 Mode 建表
var MajorLevel = mongoose.model('majorlevel',MajorLevelSchema);
module.exports = MajorLevel
