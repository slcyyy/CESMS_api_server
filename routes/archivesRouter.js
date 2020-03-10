var express = require('express');
var router = express.Router();
var multer = require('multer')


var storage = multer.diskStorage({
	destination:function(req,file,cb){
		//指定文件路径
		cb(null,'./public/images')
	},
	filename:function(req,file,cb){
		//指定文件名
		let ext = file.originalname.split('.')[1]
		let tmpname = (new Date()).getTime()+parseInt(Math.random()*9999)
    cb(null,`${tmpname}.${ext}`);
	}
});

var upload = multer({
	storage:storage
})

//上传图片
router.post('/uploadImage',upload.single('hehe'),(req,res)=>{
	//hehe 要上传如片数据的key值 必须和前端保持统一
	/* 
	{
		'hehe':图片数据
	}
	*/
  let {size,mimetype,path} = req.file
	let types = ['jpg','jpeg','png','gif']
	let tempType = mimetype.split('/')[1]
	
	//3M
	if(size > 3145728){
		return res.send({err:-1,msg:'尺寸过大'})
	}
	else if(types.indexOf(tempType) == -1){
		return res.send({err:-1,msg:'图片格式不对'})
	}
	else{
		//返回上传的服务器地址
		//会自动覆盖 
		let url = `/public/img/${req.file.filename}`
		console.log(req.file)
		res.send({err:0,msg:'图片上传成功',img:url})
	}

})

module.exports = router