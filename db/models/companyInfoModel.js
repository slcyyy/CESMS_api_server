var mongoose = require('mongoose')
var companyInfoSchema = mongoose.Schema({
  company_id:{type:Number,required:true},
	company_name:{type:String,required:true},
});

//把这个 schema 编译成一个 Mode 建表
var CompanyInfo= mongoose.model('companyinfo', companyInfoSchema);

module.exports = CompanyInfo
