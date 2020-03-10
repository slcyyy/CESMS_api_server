var mongoose = require('mongoose')
var fillstatusSchema = mongoose.Schema({
	status_userId:{type:String,required:true},
  status_companyName:{type:String,required:true},
	status_tableName:{type:String,required:true},
	status_state:{type:Boolean,required:true},
	status_time:{type:String,required:true}
});

//把这个 schema 编译成一个 Mode 建表
var Fillstatus= mongoose.model('fillstatus', fillstatusSchema);

module.exports = Fillstatus
