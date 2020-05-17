var mongoose = require('mongoose')
var PlanTableSchema = mongoose.Schema({
	plan_tableId:{type:Number,required:true}, //考核表ID
	plan_tableName:{type:String,required:true},//考核表名称
	plan_tableHeader:{type:String,required:true}//考核表的表头数据
});

//把这个 schema 编译成一个 Mode 建表
var PlanTable = mongoose.model('planTable',PlanTableSchema,'planTable');
module.exports = PlanTable