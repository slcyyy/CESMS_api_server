var mongoose = require('mongoose')
var powersSchema = mongoose.Schema({
  powers_id:{type:Number,required:true},
	powers_name: {type:String,required:true},
	powers_pId: {type:Number,required:true},
	powers_level:{type:Number,required:true},
	power_pRoleId:{type:String,required:true},
});

//把这个 schema 编译成一个 Mode 建表
var Powers = mongoose.model('powers', powersSchema);

module.exports = Powers
