var express = require('express');
var router = express.Router();
// var multer = require('multer')
const ChemiInfo =  require('../db/models/chemiInfoModel')
const ChemiStorage = require('../db/models/chemiStorageModel')
const Law = require('../db/models/lawsModel')
const Unit = require('../db/models/unitModel')
var multer = require('multer')
var fs = require('fs')


// //上传图片
// router.post('/uploadImage', upload.single('hehe'), (req, res) => {
// 	//hehe 要上传如片数据的key值 必须和前端保持统一
// 	/* 
// 	{
// 		'hehe':图片数据
// 	}
// 	*/
// 	let {
// 		size,
// 		mimetype,
// 		path
// 	} = req.file
// 	let types = ['jpg', 'jpeg', 'png', 'gif']
// 	let tempType = mimetype.split('/')[1]

// 	//3M
// 	if (size > 3145728) {
// 		return res.send({
// 			err: -1,
// 			msg: '尺寸过大'
// 		})
// 	} else if (types.indexOf(tempType) == -1) {
// 		return res.send({
// 			err: -1,
// 			msg: '图片格式不对'
// 		})
// 	} else {
// 		//返回上传的服务器地址
// 		//会自动覆盖 
// 		let url = `/public/img/${req.file.filename}`
// 		console.log(req.file)
// 		res.send({
// 			err: 0,
// 			msg: '图片上传成功',
// 			img: url
// 		})
// 	}

// })

//===============危险化学品特性==============================

// /**
//  * @api {get} /archives/getChemiInfo 获取化学品信息
//  * @apiGroup Archives
//  *
//  **/
router.get('/getChemiInfo',async (req,res)=>{
	try{
		let {query} = req.query
		var chemiInfo = []
		if(query!=''&& query!=null){
			query = new RegExp(query)
	    chemiInfo = await ChemiInfo.find({chemi_name:query},{_id: 0})
		}
		else{
			chemiInfo = await ChemiInfo.find(null,{_id: 0})
		}
		res.send({
			chemiInfo,
			meta: {
				msg: "返回化学品信息成功",
				err: 0
			}
		})
	}
	catch(e){
		console.log(e)
		res.send({
			meta: {
				msg: "返回化学品信息失败",
				err: -1
			}
		})
	}
})

router.get('/getUnitOptions',async (req,res)=>{
	try{
		 unitOptions = await Unit.find({},{_id:0,unit_id:1,unit_name:1,unit_updataTime:1}).sort({unit_id:1})
	   res.send({unitOptions,meta:{err:0}})
	}
	catch(e){
		res.send({meta:{err:-1}})
	}
	
})


/**
 * @api {post} /archives/addChemiInfo 添加化学品信息
 * @apiGroup Archives
 **/
router.post('/addChemiInfo', (req, res) => {
	let {addForm} = req.body
	let chemi_name = addForm.chemi_name
	ChemiInfo.updateOne({chemi_name},addForm,{upsert:true})
    .then((data) => {
			return res.send({
				meta: {
					msg: "添加/修改化学品信息成功",
					err: 0
				}
			})
		})
		.catch(err => {
			console.log(err)
			return res.send({
				meta: {
					msg: "添加/修改化学品信息失败",
					err: -1
				}
			})
		})
})


/**
 * @api {put} /archives/putChemiInfo 修改化学品信息
 * @apiGroup Archives
 *
 **/
router.put('/putChemiInfo',async (req,res)=>{
	try{
		let {editForm,chemi_name} = req.body
		await ChemiInfo.updateOne({chemi_name},editForm,{upsert:false})
	  res.send({meta: {err: 0,msg: '修改化学品信息成功'} })
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


// /**
//  * @api {post} /archives/deleteChemiInfo 删除化学品信息
//  * @apiGroup Archives
//  *
//  **/
router.delete('/deleteChemiInfo', (req, res) => {
	let {chemi_name} = req.query
	ChemiInfo.deleteOne({
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


//===============危险化学品管理==============================

//获取化学品管理信息
router.get('/getChemiStorage',async (req,res)=>{
	try{
		//有查询 //根据区域名
		let {arrUnitID} = req.query
		//get方法获取到的数组元素是json字符串
    let query=[]
		if(arrUnitID !=undefined && arrUnitID.length>=1){
			arrUnitID.forEach(item=>{
				query.push(JSON.parse(item))
			})
			if(query.length>=1){
			  chemiStorage = await ChemiStorage.find({$or:query},{_id:0,chemi_unitId:1,chemi_name:1,chemi_device:1,chemi_allowance:1}).sort({chemi_unitId:1})	
			}
		}
		else{
			chemiStorage = await ChemiStorage.find({},{_id:0,chemi_unitId:1,chemi_name:1,chemi_device:1,chemi_allowance:1}).sort({chemi_unitId:1})
		}
		//空数组的boolean值是true
		//没有查询
		chemiStorage.sort(function(a,b){
			if(a.chemi_unitId == b.major_unitId){
			   return (a.chemi_name).localeCompare(b.chemi_name)
		 }
		})
		 res.send({chemiStorage,meta:{err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1,msg:"获取化学品管理信息列表失败"}})
	}
})

router.post('/addChemiStorage',async (req,res)=>{
	try{
		let {addForm,isNew} = req.body
		//修改存储单元的更新时间
		if(isNew){
			await Unit.insertMany({unit_id:addForm.chemi_unitId,unit_name:addForm.chemi_unit,unit_updataTime:addForm.updataTime})
		}
		else{
			await Unit.updateOne({unit_id:addForm.chemi_unitId},{unit_updataTime:addForm.updataTime})
		}
		let form = addForm.children
		form.forEach(item=>{
		 	item.chemi_unitId = addForm.chemi_unitId
		})
		await ChemiStorage.insertMany(form)
		res.send({meta:{err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
	
})

router.delete('/deleteStorage',async (req,res)=>{
	try{
		let {deleteData,type} = req.query
		if(type=='all'){
			await Unit.deleteMany({unit_id:deleteData})
		  await ChemiStorage.deleteMany({chemi_unitId:deleteData})
		}
		else{
			deleteData = JSON.parse(deleteData)
			await Unit.updateOne({unit_id:deleteData.chemi_unitId},{unit_updataTime:deleteData.updataTime})
			delete deleteData.updataTime
			await ChemiStorage.deleteOne(deleteData)
		}
		res.send({meta:{err:0}})
	}catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
})


router.put('/putStorage',async(req,res)=>{
	try{
		let {editForm} = req.body
		await Unit.updateOne({unit_id:editForm.chemi_unitId},{unit_updataTime:editForm.updataTime})
		let form = editForm.children
		form.forEach(item=>{
		 	item.chemi_unitId = editForm.chemi_unitId
		})
		await ChemiStorage.deleteMany({chemi_unitId:editForm.chemi_unitId})
		await ChemiStorage.insertMany(form)
		res.send({meta:{err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
})
//======================法律法规管理========================
// /**
//  * @api {get} /archives/getLaws 获取法律法规条目
//  * @apiGroup Archives
//  **/
router.get('/getLaws', async (req, res) => {
	try {
		var laws=[]
		let {query} = req.query
		if(query!=''&& query!=undefined){
				query = new RegExp(query)
				laws = await Law.find({law_name:query},{_id:0})
			}
		else
   		laws = await Law.find({},{_id:0})
		res.send({laws,meta:{err:0}})
		return;
	} 
	catch (err) {
		console.log(err)
		res.send({
			meta: {
				err: -1,
				msg: '获得法律法规数据失败'
			}
		})
		}
})

var upload = multer({
	storage: multer.diskStorage({
		destination: function(req, file, cb) {
			//指定文件路径
			cb(null, './public/laws')
		},
		filename: function(req, file, cb) {
			//指定文件名
			 cb(null, file.originalname);
		}
	})
})

/**
 * @api {post} /archives/addLaw 添加法律法规条目
 * @apiGroup Archives
 *
 **/
 //因为只上传一个所以用single
 router.post('/addLaw', upload.single('lawFile'), async (req, res) => {
	 try{
		 //获取上传的文件
		 let {filename} = req.file
		 //获取其他的数据信息
		 let {lawInfo,oldEditForm} = req.body
		 let addForm = JSON.parse(lawInfo)
		 addForm.law_url = `public/laws/${filename}`
		 if(oldEditForm != undefined){
			 let law_name= JSON.parse(oldEditForm).law_name
			 let law_id = JSON.parse(oldEditForm).law_id
	     await Law.updateOne({law_name,law_id},addForm)		 
		 }
		 else{
			 //又有改动数据,又有上传文件
			  await Law.updateOne({law_name:addForm.law_name,law_id:addForm.law_id},addForm,{upsert:true})	
		 }
	
		 // await Law.insertMany(addForm)
		 res.send({meta: {err: 0,msg: '添加法律法规成功'}})
	 }
	 catch(e){
		 console.log(e)
		 res.send({meta:{err:-1}})
	 }
 })


router.put('/putlaw',async (req,res)=>{
	try{
		let {editForm,oldEditForm} = req.body
		await Law.updateOne({law_name:oldEditForm.law_name,law_id:oldEditForm.law_id},editForm)
	  res.send({meta:{err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
})

/**
 * @api {delete} /archives/deleteLaw 删除法律法规条目
 * @apiGroup Archives
 *
 **/
router.delete('/deleteLaw', (req, res) => {
	let {law_name,law_id,law_url} = req.query
	//找到这个源文件并删除
	let arr = law_url.split('/')
	let filename = arr[arr.length-1]
	console.log(`public/laws/${filename}`)
	fs.exists(`public/laws/${filename}`,function(exists){
	  if(exists){
	     fs.unlink(`public/laws/${filename}`,err=>err)
	  }
	 })
	Law.deleteMany({
			law_name,law_id
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
