var mongoose = require('mongoose')
var usersSchema = mongoose.Schema({
	user_id: {type:String,required:true},
  user_name: {type:String,required:true},
	user_pwd: {type:String,required:true},
	user_roleId: {type:String,required:true},
	user_depa:{type:String,required:true},
	user_IDCard:{type:String,required:false},
  user_phone:{type:String,required:false}
});
//把这个 schema 编译成一个 Mode 建表
var User = mongoose.model('user', usersSchema,'user');

module.exports = User
