var express = require('express');
var router = express.Router();
var multer = require('multer')
const ChemiInfo = require('../db/models/chemiInfoModel')
const Law = require('../db/models/lawsModel')
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		//指定文件路径
		cb(null, './public/images')
	},
	filename: function(req, file, cb) {
		//指定文件名
		let ext = file.originalname.split('.')[1]
		let tmpname = (new Date()).getTime() + parseInt(Math.random() * 9999)
		cb(null, `${tmpname}.${ext}`);
	}
});

var upload = multer({
	storage: storage
})

//上传图片
router.post('/uploadImage', upload.single('hehe'), (req, res) => {
	//hehe 要上传如片数据的key值 必须和前端保持统一
	/* 
	{
		'hehe':图片数据
	}
	*/
	let {
		size,
		mimetype,
		path
	} = req.file
	let types = ['jpg', 'jpeg', 'png', 'gif']
	let tempType = mimetype.split('/')[1]

	//3M
	if (size > 3145728) {
		return res.send({
			err: -1,
			msg: '尺寸过大'
		})
	} else if (types.indexOf(tempType) == -1) {
		return res.send({
			err: -1,
			msg: '图片格式不对'
		})
	} else {
		//返回上传的服务器地址
		//会自动覆盖 
		let url = `/public/img/${req.file.filename}`
		console.log(req.file)
		res.send({
			err: 0,
			msg: '图片上传成功',
			img: url
		})
	}

})

//===============危险化学品管理==============================

/**
 * @api {get} /archives/getChemiInfo 获取化学品信息
 * @apiGroup Archives
 * @apiParam {Number} choice  为1取化学品特性数据,为2获取化学品管理列表数据.
 *
 **/
router.get('/getChemiInfo', async (req, res) => {
	try {
		let {choice} = req.query
		if(choice=='1'){
			var chemiResult = await ChemiInfo.find(null, {
				chemi_name: 1,
				chemi_hazardLevel: 1,
				chemi_defendReq:1,
				chemi_storageReq:1,
				chemi_transReq:1,
				chemi_abandonReq:1,
				_id: 0
			},
			{
				lean: true
			});
			for(let i=0;i<chemiResult.length;i++){
				 if(!chemiResult[i].hasOwnProperty('chemi_hazardLevel')){
					 chemiResult.splice(i,1)
					 i--
				 }
			}		
		} 
		else{
			var chemiResult = await ChemiInfo.find(null, {
				chemi_name: 1,
				chemi_property:1,
				chemi_location: 1,
				chemi_allowance:1,
				chemi_refreshTime:1,
				chemi_refreshRecord:1,
				_id: 0
			},{
				lean:true
			});
			for(let i=0;i<chemiResult.length;i++){
				 if(!chemiResult[i].hasOwnProperty('chemi_property')){
					 chemiResult.splice(i,1)
					 i--
				 }
			}		
		}  
		
		res.send({
			chemiResult,
			meta: {
				msg: "返回化学品信息成功",
				err: 0
			}
		})
		return;
	} catch (err) {
		console.log(err)
		res.send({
			meta: {
				msg: "返回化学品信息失败",
				err: -1
			}
		})
	}

})

/**
 * @api {post} /archives/addChemiInfo 添加化学品信息
 * @apiGroup Archives
 **/
router.post('/addChemiInfo', (req, res) => {
	let {
		addForm
	} = req.body
	let chemi_name = addForm.chemi_name
	ChemiInfo.updateOne({chemi_name},addForm,{upsert:true})
    .then((data) => {
			return res.send({
				meta: {
					msg: "添加化学品信息成功",
					err: 0
				}
			})
		})
		.catch(err => {
			console.log(err)
			return res.send({
				meta: {
					msg: "添加化学品信息失败",
					err: -1
				}
			})
		})
})
/**
 * @api {post} /archives/deleteChemiInfo 删除化学品信息
 * @apiGroup Archives
 *
 **/

router.delete('/deleteChemiInfo', (req, res) => {
	let {
		chemi_name
	} = req.query
	ChemiInfo.deleteMany({
			chemi_name
		})
		.then((data) => {
			res.send({
				meta: {
					msg: '删除化学品信息成功',
					err: 0
				}
			})
		})
		.catch((err) => {
			res.send({
				meta: {
					msg: '删除化学品信息失败',
					err: -1
				}
			})
		})
})
/**
 * @api {put} /archives/changeChemiInfo 修改化学品信息
 * @apiGroup Archives
 *
 **/
router.put('/changeChemiInfo',async (req,res)=>{
	try{
		let {editForm,chemi_name} = req.body
		console.log(chemi_name)
		await ChemiInfo.updateOne({chemi_name},editForm,{upsert:false})
	  res.send({
	  	meta: {
	  		err: 0,
	  		msg: '修改化学品信息成功'
	  	}
	  })
	  return;
	}
	catch(err){
		console.log(err)
		res.send({
			meta: {
				err: -1,
				msg: '修改化学品信息失败'
			}
		})
		return;
	}
})

//======================法律法规管理========================
/**
 * @api {get} /archives/getLaws 获取法律法规条目
 * @apiGroup Archives
 **/
router.get('/getLaws', async (req, res) => {
	try {
		let laws = await Law.find({}, null)
		res.send({
			laws,
			meta: {
				err: 0,
				msg: '获得法律法规数据成功'
			}
		})
		return;
	} catch (err) {
		res.send({
			meta: {
				err: -1,
				msg: '获得法律法规数据失败'
			}
		})
		return;
	}

})
/**
 * @api {post} /archives/addLaw 添加法律法规条目
 * @apiGroup Archives
 *
 **/
router.post('/addLaw', async (req, res) => {
	let {
		addData
	} = req.body
	console.log(addData)
	try {
		let result = await Law.insertMany(addData)
		res.send({
			meta: {
				err: 0,
				msg: '添加法律法规条目成功'
			}
		})
		return;
	} catch (err) {
		console.log(err)
		res.send({
			meta: {
				err: -1,
				msg: '添加法律法规条目失败'
			}
		})
		return;
	}
})
/**
 * @api {delete} /archives/deleteLaw 删除法律法规条目
 * @apiGroup Archives
 *
 **/
router.delete('/deleteLaw', (req, res) => {
	let {
		law_name
	} = req.query
	Law.deleteMany({
			law_name
		})
		.then((data) => {
			res.send({
				meta: {
					msg: '删除该法律法规条目成功',
					err: 0
				}
			})
		})
		.catch((err) => {
			res.send({
				meta: {
					msg: '删除该法律法规条目失败',
					err: -1
				}
			})
		})
})


module.exports = router
