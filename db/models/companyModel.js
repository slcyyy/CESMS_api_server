var mongoose = require('mongoose')
var companySchema = mongoose.Schema({
  company_id:{type:Number,required:true},
	company_name:{type:String,required:true},
});

//把这个 schema 编译成一个 Mode 建表
var Company= mongoose.model('company', companySchema,'company');

module.exports = Company
