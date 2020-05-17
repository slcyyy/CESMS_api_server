var mongoose = require('mongoose')
var chemiInfoSchema = mongoose.Schema({
	chemi_name:{type:String,required:true},//物质
	chemi_property:{type:String,required:false},// 特性
	chemi_defend:{type:String,required:false},
  chemi_storage: {type:String,required:false},
	chemi_transition: {type:String,required:false},
	chemi_abandon:{type:String,required:false}
});

//把这个 schema 编译成一个 Mode 建表
var ChemiInfo = mongoose.model('chemiInfo',chemiInfoSchema,'chemiInfo');

module.exports = ChemiInfo
