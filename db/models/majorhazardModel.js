// 危险化学品重大危险源辨识
var mongoose = require('mongoose')
var MajorHazardSchema = mongoose.Schema({
	// major_isRisk:{type:Boolean,requ,
	// re:false}, //是否重大危险源
  major_unit:{type:String,required:true}, //存储区域
	major_chemical:{type:String,required:true},//物质
	major_device:{type:String,required:true},//设备
	major_num:{type:Number,required:false}, //数量npm
	major_singleStorage:{type:Number,required:true}, //单个物质存储量
	major_criticalMass:{type:Number,required:true},//临界量
	
});

//把这个 schema 编译成一个 Mode 建表
var MajorHazard= mongoose.model('majorhazard',MajorHazardSchema);
module.exports = MajorHazard
