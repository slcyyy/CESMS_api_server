var mongoose = require('mongoose')
var checklistSchema = mongoose.Schema({
  checklist_id:{type:String,required:true},
	checklist_trouble:{type:Number,default:0},
	checklist_content:{type:String,required:true},
	//检查依据和检查方法都不是必须的
	checklist_basis:{type:String},
	checklist_method:{type:String},
	checklist_pId:{type:Number,required:true},
	checklist_cId:{type:Number,required:true},
});

//把这个 schema 编译成一个 Mode 建表
var Checklist = mongoose.model('checklists', checklistSchema);

module.exports = Checklist
