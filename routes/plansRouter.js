const express = require('express')
const router = express.Router()
const Plan = require('../db/models/planModel')
const PlanTable = require('../db/models/planTableModel')
const Power = require('../db/models/powersModel')

//获取用户的安全计划表
router.get('/getPlan',async (req,res)=>{
	try{
		let {userId} = req.query
		let plans = await Plan.find({plan_userId:userId},{_id:0,plan_userId:0},{lean:true})
		res.send({plans,meta:{err:0,msg:'获取所有安全计划表数据成功'}})
		return 
	}
	catch(e){
		res.send({meta:{err:-1,msg:'获取所有安全计划表数据失败'}})
		return
	}
})


router.get('/getPlanByName',async (req,res)=>{
	try{
		let {title} = req.query
		let tables = await Plan.find({plan_title:title},{_id:0})
		res.send({tableInfo:tables[0],meta:{msg:'查询计划表内各考核表成功',err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
})

//添加安全计划表信息
router.post('/addPlan',async (req,res)=>{
	try{
		let {planData,userId} = req.body
		let str=''
		for(let i=0;i<planData.children.length;i++){
			let name = planData.children[i].tableName
			let header = planData.children[i].header.join('|') 
			 str += name+','+header+'&&'
		}
		let addForm={
			plan_title:planData.plan_title,
			plan_userId:userId,
			plan_tables:str
		}
		await Plan.insertMany(addForm)
		res.send({meta:{msg:"ok",err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}

})
	
//删除安全表
router.get('/getPlanByName',async (req,res)=>{
	try{
		let {title} = req.query
		let tables = await Plan.find({plan_title:title},{_id:0})
		res.send({tableInfo:tables[0],meta:{msg:'查询计划表内各考核表成功',err:0}})
	}
	catch(e){
		res.send({meta:{err:-1}})
	}
})

//添加安全计划表信息
router.post('/deletePlan',async (req,res)=>{
	try{
		let {deleteArr} = req.body
		console.log(deleteArr)
		await Plan.deleteMany({$or:deleteArr})
		res.send({meta:{msg:"ok",err:0}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}

})
	

module.exports = router;