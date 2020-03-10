var mongoose = require('mongoose')
var rolesSchema = mongoose.Schema({
  role_id:{type:Number,required:true},
	role_name: {type:String,required:true},
	user_powers: {type:String,required:true},
	user_desc: {type:String,required:true},
});

//把这个 schema 编译成一个 Mode 建表
var Role = mongoose.model('roles', rolesSchema);

module.exports = Role
