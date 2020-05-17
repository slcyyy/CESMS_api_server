var mongoose = require('mongoose')
var PlanSchema = mongoose.Schema({
	plan_title:{type:String,required:true}, //计划表名称
	plan_userId:{type:String,required:true},	//创建用户ID
  plan_tables:{type:String,required:true} //考核表数据
});

//把这个 schema 编译成一个 Mode 建表
var Plan = mongoose.model('plan',PlanSchema,'plan');
module.exports = Plan