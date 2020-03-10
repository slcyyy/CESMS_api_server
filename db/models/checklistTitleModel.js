var mongoose = require('mongoose')
var checklistTitleSchema = mongoose.Schema({
  title_id:{type:Number},
	title_name:{type:String},
	title_pId:{type:Number,default:0}
});

//把这个 schema 编译成一个 Mode 建表
var ChecklistTitle = mongoose.model('checklisttitles', checklistTitleSchema);

module.exports = ChecklistTitle
