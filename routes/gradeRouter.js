const express = require('express')
const router = express.Router()
const xlsx = require('node-xlsx')
const fs = require('fs')
const Checklist = require('../db/models/checklistModel')
const ChecklistTitle = require('../db/models/checklistTitleModel')
const Fillstatus = require('../db/models/fillstatusModel')
const CompanyInfo = require('../db/models/companyInfoModel')
const FillRecord = require('../db/models/fillrecordsModel')
const FillStatus = require('../db/models/fillstatusModel')
var multer = require('multer')

router.get('/test', (req, res) => {

	FillRecord.find({
			fill_userId: 'A20200208001',
			fill_fTableId: 2
		}, {
			fill_itemId: 1,
			fill_status: 1,
			fill_question: 1,
			fill_advice: 1,
			fill_grade: 1,
		}, {
			lean: true
		}).sort({
			fill_itemId: -1
		})
		.then((data) => {
			res.send(data)
		})
		.catch(err => err)
})

/**
 * @api {get} /grade/selectList 获取评分表的下拉框数据
 * @apiName GetSelectList
 * @apiGroup Grade
 *
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "selectList": [
 *       {
 *           "id": 1,
 *           "label": "国服",
 *           "children": [
 *               {
 *                   "id": 1,
 *                   "label": "1 安全基础管理安全风险隐患排查表"
 *               },
 *               {
 *                   "id": 2,
 *                   "label": "2 设计与总图安全风险隐患排查表"
 *               }
 *           ]
 *       },
 *       {
 *           "id": 2,
 *           "label": "阿里",
 *           "children": [
 *               {
 *                    "id": 1,
 *                      "label": "1 安全基础管理安全风险隐患排查表"
 *               },
 *               {
 *                   "id": 2,
 *                   "label": "2 设计与总图安全风险隐患排查表"
 *               }
 *           ]
 *       }
 *   ],
 *   "meta": {
 *       "err": 0,
 *       "msg": "查询级联选择框数据成功"
 *   }
 *     }
 *
 *
 * 
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       meta:{err:-1,msg:'查询级联选择框数据失败'}
 *     }
 */
//返回级联选择框
router.get('/selectList', async (req, res) => {
	try {
		//找到所有的大表名
		let tableInfo = await ChecklistTitle.find({
			title_pId: 0
		}, {
			title_id: 1,
			title_name: 1,
			_id: 0
		}, {
			lean: true
		})
		//找到所有的公司名
		let companyInfo = await CompanyInfo.find({}, {
			_id: 0
		}, {
			lean: true
		})
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
		res.send({
			meta: {
				err: -1,
				msg: '查询级联选择框数据失败'
			}
		})
	}
})

//解析打分表
router.get('/parseTables', (req, res) => {
	//这个路径是从根路径开始的
	let dirs = fs.readFile('public/checklists/评分表.xlsx', (err, file) => {
		if (err) throw err;
		//  解析得到文档中的所有 sheet
		var sheetList = xlsx.parse(file)
		//遍历 sheet
		let fID = 0
		let cID = 0

		sheetList.forEach(function(sheet) {
			//i为行号
			for (let i = 0; i < sheet.data.length; i++) {
				//把表头去掉
				if (i == 0) {
					continue;
				}
				//不为空行
				if (sheet.data[i][0] !== undefined) {
					//获取到当前表格的ID值,第一项表示所属大表格,第二项代表所属子表格
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
						Checklist.insertMany(insert)
							.catch(err => {
								res.send({
									meta: {
										err: -1,
										msg: '解析表格失败'
									}
								})
							})
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
							ChecklistTitle.insertMany(fTitle)
								.catch(err => err)
						} else {
							//子标题
							cID++
							tmpcID = (Number)((String)(fID) + (String)(cID))
							let cTitle = {
								title_id: tmpcID,
								title_name: sheet.data[i][0],
								title_pId: fID
							}
							ChecklistTitle.insertMany(cTitle)
								.catch(err => {
									console.log(err => err)
								})
						}
					}
				}
			}
		})

		res.send({
			meta: {
				err: 0,
				msg: '解析表格成功'
			}
		})
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

//根据Id返回评分表表单
router.get('/getChecklistData', async (req, res) => {
	//得到父表的ID
	let {
		checklist_pId,
		fill_userId,
		fill_companyId
	} = req.query
	console.log(fill_companyId)
	//找到所有的子表内容
	try {
		//用于记录是否有填写记录
		var record = false
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
			//该子表的每一项的填写
			//let fillRecords = await FillRecord.find({fill_userId,fill_cTableId:cTable[i].title_id},{_id:0,fill_itemId:1,fill_status:1,fill_question:1,fill_advice:1,fill_grade:1,},{lean:true}).sort({fill_itemId:1})
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
			record,
			meta: {
				err: 0,
				msg: '返回评分表数据成功'
			}
		})
	} catch (err) {
		console.log(err)
		return res.send({
			cTable,
			record,
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
	let {
		submitTable,
		fill_userId,
		fill_companyId,
		fill_fTableId,
		fillTime,
		companyName,
		tableName
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
	try{
		for (let i = 0; i < arr.length; i++) {
			await FillRecord.updateOne({
				  fill_userId,
					fill_companyId,
					fill_fTableId,
					fill_itemId: arr[i].fill_itemId
				}, {
					fill_status: arr[i].fill_status,
					fill_question: arr[i].fill_question,
					fill_advice: arr[i].fill_advice,
					fill_grade: arr[i].fill_grade,
					fill_time:arr[i].fill_time
				},
				{upsert:true})
		}
		//存入状态表
		await FillStatus.updateOne({
			status_userId:fill_userId,
			status_companyName:companyName,
			status_tableName:tableName
		},{
			status_state:true, //默认是已提交的
			status_time:fillTime
		},{
			upsert:true
		})
		
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
 * @apiParam {Number} fill_userId unique ID.
 *
 * @apiSuccess {String} firstname Firstname of the User.
 * @apiSuccess {String} lastname  Lastname of the User.
 */
router.get('/getFillRecord',async (req,res)=>{
	try{
		let {fill_userId} = req.query
		const fillStatus = await FillStatus.find({status_userId:fill_userId},{_id:0,status_userId:0})
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


module.exports = router;
