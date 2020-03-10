const nodemailer = require("nodemailer");
//创建发送邮件的请求对象
 let transporter = nodemailer.createTransport({
    host: "smtp.qq.com", //发送方使用的邮箱类型的地址信息 这里表示使用QQ邮箱
    port: 465, //端口号
    secure: true, // true for 465, false for other ports
    auth: {
      user: '631674132@qq.com', // 发送方实际的邮箱地址
      pass: 'jdqfagsmzbevbeij' // SMTP验证码
    }
  });

  // send mail with defined transport object
  //设置邮箱计时器 每秒钟 别轻易尝试,可能会被封
  // setInterval(()=>{
	 //   transporter.sendMail(mailobj)
  // },1000)

  
   //1284514217@qq.com
//封装一个自定义模块,向固定的邮箱发送固定的信息
// xxx.send(mail,msg)
function send(email,code){
	//创建邮件信息
	let mailobj={
		from: '"LUO C" <631674132@qq.com>', // sender address
		to: email, // list of receivers
		subject: "20200206", // Subject line
		//支持模板字符串${}替换的字符串不是用引号的，是用`符号
		text: `Hello Ljj,您的验证码是 ${code} ,有效时间是30分钟`, // plain text body
		// html: "<b>Hello world?</b>" ,// html body
		//文本和网页信息只能一个
	}
	//异步操作
	return new Promise((resolve,reject)=>{
		transporter.sendMail(mailobj,(err,data)=>{
		  if(err){
				reject('{err:-1,msg:验证码发送失败}')
		  }else{
				console.log(data)
		  	resolve('{err:0,msg:验证码发送成功}')
		  }
		})
		
	})
	
}

// let obj = {
// 	send:send
// }  

module.exports = {send:send}