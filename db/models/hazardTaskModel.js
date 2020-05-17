//风险评估
var mongoose = require('mongoose')
var hazardTaskSchema = mongoose.Schema({
	hazard_taskId:{type:String,required:true}, //工作任务ID
  hazard_task:{type:String,required:true} ,//工作任务名
});

//把这个 schema 编译成一个 Mode 建表
var hazardTask = mongoose.model('hazardTask',hazardTaskSchema,'hazardTask');
module.exports = hazardTask
