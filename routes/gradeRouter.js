const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx')
const fs = require('fs')
const Checklist = require('../db/models/checklistModel')
const ChecklistTitle = require('../db/models/checklistTitleModel')
const Fillstatus = require('../db/models/fillstatusModel')
const Company = require('../db/models/companyModel')
const FillRecord = require('../db/models/fillrecordsModel')
const FillStatus = require('../db/models/fillstatusModel')
const User = require('../db/models/usersModel')
var multer = require('multer')


//返回级联选择框
router.get('/EvaTSelectData', async (req, res) => {
	try {
		//找到所有的大表名
		let tableInfo = await ChecklistTitle.find({title_pId: 0}, {title_pId: 0,_id: 0}, {lean: true})
		//找到所有的公司名
		let companyInfo = await Company.find({}, {_id: 0}, {lean: true})
		let selectList = []
		companyInfo.forEach((company, index) => {
			let item = {}
			item.id = company.company_id
			item.label = company.company_name
			item.children = []
			tableInfo.forEach((table, index) => {
				let child = {}
				child.id = table.title_id
				child.label = table.title_name
				item.children.push(child)
			})
			selectList.push(item)
		})
		res.send({
			selectList,
			meta: {
				err: 0,
				msg: '查询级联选择框数据成功'
			}
		})
	} catch (err) {
		console.log(err)
		res.send({
			meta: {
				err: -1,
				msg: '查询级联选择框数据失败'
			}
		})
	}
})

//解析打分表 	//这个路径是从根路径开始的
router.get('/parseTables', (req, res) => {
	let dirs = fs.readFile('public/checklists/评分表.xlsx', (err, file) => {
		if (err) throw err;
		//  解析得到文档中的所有 sheet
		var sheetList = xlsx.parse(file)
		let fID = 0,cID = 0  //每一个子表标题,孙子表标题的序号
		let insertTable = [],insertTitle=[]
		sheetList.forEach(function(sheet) {
			for (let i = 0; i < sheet.data.length; i++) {
				if (i == 0) continue
				if (sheet.data[i][0] !== undefined) {
					//不为合并行
					if (sheet.data[i].length > 1) {
						let currentID = sheet.data[i][0].split('.')
						fatherTableID = currentID[0]
						childTableID = currentID[1]
						let insert = {
							checklist_id: sheet.data[i][0],
							checklist_trouble: sheet.data[i][1],
							checklist_content: sheet.data[i][2],
							checklist_basis: sheet.data[i][3],
							checklist_method: sheet.data[i][4],
							checklist_pId: fatherTableID,
							checklist_cId: (Number)((String)(fatherTableID) + (String)(childTableID))
						}
						insertTable.push(insert)
					}
					//当为合并行时,存储大小标题
					if (sheet.data[i].length == 1) {
						let j = i + 1
						//父标题
						if (sheet.data[j].length == 1) {
							fID++
							cID = 0
							let fTitle = {
								title_id: fID,
								title_name: sheet.data[i][0]
							}
							insertTitle.push(fTitle)
						} else {
							//子标题
							cID++
							tmpcID = (Number)((String)(fID) + (String)(cID))
							let cTitle = {
								title_id: tmpcID,
								title_name: sheet.data[i][0],
								title_pId: fID
							}
							insertTitle.push(cTtile)
						}
					}
				}
			}
		})
    Checklist.insertMany(insertTable).catch(err => {res.send({meta: {err: -1,msg: '解析表格失败'}})})
	  ChecklistTitle.insertMany(insertTable).catch(err =>  {res.send({meta: {err: -1,msg: '解析表格失败'}})})
		res.send({meta: {err: 0,msg: '解析表格成功'}})
	})
})

//上传表
var storage = multer.diskStorage({
	destination: function(req, file, cb) {
		cb(null, './public/checklists') // 保存的路径，备注：需要自己创建
	},
	filename: function(req, file, cb) {
		cb(null, file.originalname);
	}
})
///构造multer对象multer(opt)
//opt是个key-value对象，包含属性dest/storage,fileFilter,limits.分表表示文件的存储位置/方式，文件过滤，文件大小限制.
var upload = multer({
	storage: storage
})


router.post('/uploadTable', upload.single('checklist'), (req, res) => {
	let {
		filename,
		size,
		path,
	} = req.file
	//返回上传的服务器地址
	let url = `/public/checklists/${filename}`
	res.send({
		meta: {
			err: 0,
			msg: '文件上传成功',
		},
		url: url
	})
})


/**
 * @api {post} /grade/changeCompany
 * @apiName 修改公司数据
 * @apiGroup Grade
 **/
 router.post('/changeCompany',async (req,res)=>{
	 try{
		 let {companyName} = req.body
		 console.log(companyName)
		 let arr = companyName.split('/')
		 let company=[]
		 for(let i=0;i<arr.length;i++){
			 let index = i+1
			 let temp = {company_id:index,company_name:arr[i]}
			 company.push(temp)
		 }
		 console.log(company)
		 await FillRecord.deleteMany({})
		 await FillStatus.deleteMany({})
		 await Company.deleteMany({})
		 await Company.insertMany(company)
		 res.send({meta:{err:0}})
	 }
	 catch(e){
		 console.log(e)
		 res.send({meta:{err:-1}})
	 }
 })

//获取评分表的地址
router.get('/getPresetData',(req,res)=>{
	//判断当前页面是否存在评分表
	let dirs = fs.readdir('public/checklists',async (err,data)=>{
	  if(data.length>0){
	  	let url='public/checklists/评分表.xlsx';
			//获取公司数据
			let company = await Company.find({},{_id:0,company_name:1})
	  	res.send({url,company,meta:{msg:'已上传评分表',err:0}})
	  }
		else{
			res.send({meta:{msg:'暂未上传评分表',err:-1}})
		}
	})
})



//根据Id返回评分表表单
router.get('/getChecklistData', async (req, res) => {
	//得到父表的ID
	let {
		checklist_pId,
		fill_userId,
		fill_companyId,
		tableName
	} = req.query
	//找到所有的子表内容
	try {
		//找到所属大表的所有子表名称和子表id
		var cTable = await ChecklistTitle.find({
    title_pId: checklist_pId,
		}, {
			title_id: 1,
			title_name: 1,
			_id: 0
		}, {
			lean: true
		}).sort({
			title_id: 1
		})
		//判断用户的填写状态
		let temp = await FillStatus.find({
			status_userId:fill_userId,
			status_companyId:fill_companyId,
			status_tableName:tableName,
			},
			{_id:0,status_state:1})
		//如果填写返回状态码 0表示暂存 1表示已填写 -1表示未填写
		if(temp.length>0){
			status=temp[0].status_state
		}
		else 
	    status = -1
			
		//先往children里塞评分表的原有信息
		for (let i = 0; i < cTable.length; i++) {
			cTable[i].children = []
			//该子表每一项的固定内容
			let content = await Checklist.find({
				checklist_cId: cTable[i].title_id
			}, {
				_id: 0
			}, {
				lean: true
			}).sort({
				checklist_id: 1
			})
				//往children里面塞用户填写的数据
				let fillRecords = await FillRecord.find({
					fill_userId,
					fill_companyId,
					fill_cTableId: cTable[i].title_id
				}, {
					_id: 0,
					fill_itemId: 1,
					fill_status: 1,
					fill_question: 1,
					fill_advice: 1,
					fill_grade: 1
				}, {
					lean: true
				}).sort({
					fill_itemId: 1
				})
				//往content中插入填写的数据,这两项顺序和长度是一样的
				for (let j = 0; j < content.length; j++) {
					if (fillRecords.length>1) {
						content[j].checklist_status = fillRecords[j].fill_status
						content[j].checklist_question = fillRecords[j].fill_question
						content[j].checklist_advice = fillRecords[j].fill_advice
						content[j].checklist_grade = fillRecords[j].fill_grade
						record = true
					}
					cTable[i].children.push(content[j])
				}
			
		
		}

		return res.send({
			cTable,
			status,
			meta: {
				err: 0,
				msg: '返回评分表数据成功'
			}
		})
	} catch (err) {
		console.log(err)
		return res.send({
			meta: {
				err: -1,
				msg: '返回评分表数据失败'
			}
		})
	}
})

//保存提交的评分表数据
/*
保存第一次提交的,保存第二次提交的
*/
router.post('/saveChecklist', async (req, res) => {
try{
	let {
		submitTable,
		fill_userId,
		fill_companyId,
		fill_fTableId,
		fillTime,
		companyName,
		tableName,
		type
	} = req.body
	//处理输入数据
	let arr = []
	for (let i = 0; i < submitTable.length; i++) {
		for (let j = 0; j < submitTable[i].children.length; j++) {
			let insert = {
				fill_userId,
				fill_companyId,
				fill_fTableId,
				fill_cTableId: submitTable[i].fill_cTableId,
			}
			insert.fill_itemId = submitTable[i]['children'][j].fill_itemId
			insert.fill_status = submitTable[i]['children'][j].fill_status
			insert.fill_question = submitTable[i]['children'][j].fill_question
			insert.fill_advice = submitTable[i]['children'][j].fill_advice
			insert.fill_grade = submitTable[i]['children'][j].fill_grade
			arr.push(insert)
		}
	}
		await FillRecord.deleteMany({fill_userId,fill_companyId,fill_fTableId})
		await FillRecord.insertMany(arr)
		//存入状态表
		if(type=='1'){
			await FillStatus.updateOne({
				status_userId:fill_userId,
				status_companyId:fill_companyId,
				status_tableName:tableName
			},{status_state:0, //0是进行中暂存
				status_time:fillTime
			},
			{
				upsert:true
			})
		}
		else{
			await FillStatus.updateOne({
				status_userId:fill_userId,
				status_companyId:fill_companyId,
				status_tableName:tableName
			},{status_state:1, //1是提交
				status_time:fillTime
			},
			{
				upsert:true
			})
		}
		
		
		return res.send({meta: {
					err: 0,
					msg: '保存评分表填写数据成功'
				}})
	}
	catch(err){
		console.log(err)
		return res.send({meta: {
					err: -1,
					msg: '保存评分表填写数据失败'
				}})
	}

})

/**
 * @api {get} /grade/getFillRecord:fill_userId 
 * @apiName 填表人获取填写记录
 * @apiGroup Grade
 *
 */
router.get('/getFillRecord',async (req,res)=>{
	try{
		let {fill_userId} = req.query
		const fillStatus = await FillStatus.find({status_userId:fill_userId},{_id:0,status_userId:0}).sort({status_time:-1})
		return res.send({
			  fillStatus,
				meta: {
					err: 0,
					msg: '返回该填表人的填表记录成功'
				}})
	}
	catch(err){
		return res.send({
				meta: {
					err: -1,
					msg: '返回该填表人的填表记录失败'
				}})
	}
})


	
	//获取公司下拉框列表
router.get('/getCompanyList',async (req,res)=>{
	try{
		let companyInfo = await Company.find({}, {
			_id: 0
		})
		res.send({companyInfo,meta: {err: 0,msg: '获取公司信息成功'}})
	}
	catch(err){
		res.send({meta: {err:-1,msg: '获取公司信息失败'}})
	}
})	
	
/**
 * @api {get} /user/:companyId Request Enterprise Score
 * @apiName 获取企业评分结果
 * @apiGroup Grade
 *
 **/
router.get('/getScore',async (req,res)=>{
	try{
		let {companyId} = req.query
		companyId = parseInt(companyId)
	  //先找出是否有人填过这个表,没人填过的话就不用找了
		let isFill = await FillStatus.find({status_companyId:companyId},{_id:1})
		if(isFill.length>=1){
			//找出这家公司的所有填写记录
			let record = await FillRecord.find({fill_companyId:companyId},{_id:0},{lean:true}).sort({fill_fTableId:1})
			//找到每一张大表
			let table = await ChecklistTitle.find({title_pId:0},{_id:0,title_id:1,title_name:1},{lean:true}).sort({title_id:1})
			//找到所属大表的所有子表名称和子表id
			let cTable = await ChecklistTitle.find({title_pId:{$ne:0}},{_id:0},{lean:true}).sort({title_pId:1})
			let totalRealScore = 0,totalFullScore =0
			for(let i=0;i<table.length;i++){
				table[i].children=[]
				let index = 1 //index是指这是第几个子表,用来构成1.1
				let subRealScore = 0,subFullScore=0
			  for(let j=0;j<cTable.length;j++){
				  if(cTable[j].title_pId==table[i].title_id){
						let itemId = table[i].title_id+'.'+index
						let realScore=0,num=0 //num是指当前这个子表的所有项目
						for(let k=0;k<record.length;k++){
							if(record[k].fill_cTableId==cTable[j].title_id){
								 realScore += record[k].fill_grade
								 num++
							}
						}
						let form={
							itemId:itemId,
							realScore :realScore,
							fullScore :num*5,
							itemRate:(realScore/(num*5)).toFixed(4)*100+'%'
						}
						subRealScore+=realScore
						subFullScore+=num*5
						table[i].children.push(form)
						index++
					}
					table[i].subRealScore = subRealScore
					table[i].subFullScore = subFullScore
					table[i].subRate =(subRealScore/subFullScore).toFixed(4)*100+'%'
				}	
				totalRealScore+= subRealScore
				totalFullScore+=subFullScore
			}
			let totalRate=(totalRealScore/totalFullScore).toFixed(4)*100+'%'
			res.send({totalRealScore,totalFullScore,totalRate,table,meta: {err:0}})
			return
		}
		else{
			res.send({meta:{err:1,msg:"没有人填过这个表"}})
		}
	
			
	}catch(e){
		console.log(e)
		//TODO handle the exception
			res.send({meta: {err:-1}})
	}  

})

router.get('/expertList',async(req,res)=>{
	try{
		let expertList = []
		let user = await User.find({},{_id:0,user_id:1,user_name:1,user_roleId:1})
		for(let i=0;i<user.length;i++){
			let role =user[i].user_roleId.split(',')
			for(let j=0;j<role.length;j++){
				if(role[j]=='2'){
					expertList.push(user[i])
					break;
				}
			}
		}
		res.send({expertList,meta:{err:0}})
	}
	catch(e){
		res.send({meta:{err:-1}})
	}
})
module.exports = router;
