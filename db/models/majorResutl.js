// 重大危险源评估结果
var mongoose = require('mongoose')
var MajorResultSchema = mongoose.Schema({
	major_isRisk:{type:Boolean,requ,
	re:false}, //是否重大危险源
  major_areaName:{type:String,required:true}, //区域
  major_R:{type:Number,required:true}
	
});

//把这个 schema 编译成一个 Mode 建表
var MajorResult= mongoose.model('majorResult',MajorResultSchema);

module.exports = MajorResult
