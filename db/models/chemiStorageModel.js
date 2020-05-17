var mongoose = require('mongoose')
var chemiStorageSchema = mongoose.Schema({
	chemi_name:{type:String,required:true},//物质
	chemi_unitId:{type:Number,required:true}, //存储区域ID
	chemi_device:{type:String,required:false},//设备
	chemi_allowance:{type:Number,required:false}, //数量npm
	chemi_criticalMass:{type:Number,required:false},//临界量
	chemi_β:{type:Number,required:false},
});

//把这个 schema 编译成一个 Mode 建表
var ChemiStorage = mongoose.model('chemiStorage',chemiStorageSchema,'chemiStorage');

module.exports = ChemiStorage
