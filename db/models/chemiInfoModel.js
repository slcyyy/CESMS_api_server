var mongoose = require('mongoose')
var chemiInfoSchema = mongoose.Schema({
	chemi_name:{type:String,required:false},
  chemi_hazardLevel:{type:Number,required:false},
	chemi_defendReq:{type:String,required:false},
	chemi_storageReq:{type:String,required:false},
	chemi_transReq:{type:String,required:false},
	chemi_abandonReq:{type:String,required:false},
	chemi_property:{type:String,required:false},
	chemi_location:{type:String,required:false},
	chemi_allowance:{type:String,required:false},
	chemi_refreshTime:{type:String,required:false},
	chemi_refreshRecord:{type:String,required:false}
});

//把这个 schema 编译成一个 Mode 建表
var ChemiInfo= mongoose.model('chemiInfo',chemiInfoSchema);

module.exports = ChemiInfo
