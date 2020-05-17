//风险评估
var mongoose = require('mongoose')
var hazardStepSchema = mongoose.Schema({
	hazard_taskId:{type:String,required:true},
	hazard_stepId:{type:Number,required:true}, //步骤ID:指的是当前任务中的第几部
  hazard_stepName:{type:String,required:true}, //作业步骤
	hazard_frequency:{type:String,required:false}, //事故发生频率
	hazard_risk:{type:String,required:true}, //危害
  hazard_res:{type:String,required:true}, //主要后果
	hazard_L:{type:Number,required:true},// 可能性L
	hazard_S:{type:Number,required:true},  //严重性S
	hazard_R:{type:Number,required:true}, //辨识指标R
	hazard_measure:{type:String,required:true}, //现有控制措施
});

//把这个 schema 编译成一个 Mode 建表
var HazardStep = mongoose.model('hazardStep',hazardStepSchema,'hazardStep');
module.exports = HazardStep
