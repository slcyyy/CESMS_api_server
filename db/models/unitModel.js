// 危险化学品重大危险源辨识
var mongoose = require('mongoose')
var UnitSchema = mongoose.Schema({
  unit_id:{type:Number,required:true}, //存储区域ID
	unit_name:{type:String,required:true},//物质
	unit_isRisk:{type:Number,required:false},//是否重大危险源
	unit_α:{type:Number,required:false},
	unit_updataTime:{type:String,required:false},//更新存储信息的时间
  unit_S:{type:String,required:false},
	unit_R:{type:Number,required:false}
});

//把这个 schema 编译成一个 Mode 建表
var UnitSchema= mongoose.model('unit',UnitSchema,'unit');
module.exports = UnitSchema
