var mongoose = require('mongoose')
var fillrecordsSchema = mongoose.Schema({
  fill_userId:{type:String,required:true},
	fill_companyId:{type:Number,required:true},
	fill_fTableId:{type:Number,required:true},
	fill_cTableId:{type:Number,required:true},
  fill_itemId:{type:String,required:true},
	fill_status:{type:String,required:true}, //检查情况
	fill_question:{type:String,required:true},
	fill_advice:{type:String,required:true},
	fill_grade:{type:Number,required:true}
});

//把这个 schema 编译成一个 Mode 建表
var FillRecords= mongoose.model('fillrecord', fillrecordsSchema);

module.exports = FillRecords              