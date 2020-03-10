var mongoose = require('mongoose')
var usersSchema = mongoose.Schema({
	user_id: {type:String,required:true},
  user_name: {type:String,required:true},
	user_email: {type:String,required:false},
	user_pwd: {type:String,required:true},
	user_roleId: {type:String,required:true},
	user_state: {type:Boolean,default:true}
});
//把这个 schema 编译成一个 Mode 建表
var User = mongoose.model('users', usersSchema);

module.exports = User
