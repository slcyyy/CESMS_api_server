var mongoose = require('mongoose')
var lawSchema = mongoose.Schema({
	law_name:{type:String,required:true}, //法律法规名称
  law_id:{type:String,required:true}, //标准编号
	law_effectiveData:{type:String,required:true}, //生效日期
	law_issueDepa:{type:String,required:true}, //颁布部门
	law_access:{type:String,required:false}, //获取渠道
	law_identifyData:{type:String,required:true}, //识别日期
	law_useDepa:{type:String,required:true},//适用部门
	law_note:{type:String,required:false}//备注
});

//把这个 schema 编译成一个 Mode 建表
var Law = mongoose.model('law',lawSchema);

module.exports = Law
