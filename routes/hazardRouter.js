var express = require('express');
var router = express.Router();
const MajorHazard = require('../db/models/majorhazardModel')

//==========危险化学品重大危险源辨识===============
/**
 * @api {get} /hazard/getIdentifyResult 返回辨识结果
 * @apiGroup Hazard
 **/
 router.get('/getIdentifyResult',async (req,res)	=>{
	 try{
		 var identifyResult=[];
		 let {query} = req.query
		 console.log(query)
		 if(query!=''){
			 query = new RegExp(query)
			 identifyResult = await MajorHazard.find({major_unit:query},{_id:0}).sort({major_unit:1}) 
		   if(identifyResult.length==0){
				 identifyResult = await MajorHazard.find({major_chemical:query},{_id:0}).sort({major_unit:1}) 
			 }
		 }
		 else{
			 identifyResult = await MajorHazard.find({},{_id:0}).sort({major_unit:1})
		 }
		 res.send({identifyResult,meta:{err:0}})
		 return;
	 }
	 catch(e){
		 console.log(e)
     res.send({meta:{err:-1}})		 
		 return
	 }
 })
 
/**
 * @api {get} /hazard/getUnitOptions 返回存储单元列表
 * @apiGroup Hazard
 **/
router.get('/getUnitOptions',async (req,res)=>{
	try{
		let unitOptions = await MajorHazard.find({},{_id:0,major_unit:1})
	  res.send({unitOptions,meta:{msg:"返回存储区域列表成功",err:0}})
		return;
	}
	catch(e){
		console.log(e)
		res.send({meta:{msg:"返回存储区域列表失败",err:-1}})
	  return;
	}
	
})


/**
 * @api {post} /hazard/editChemical 添加或修改化学品存储信息
 * @apiGroup Hazard
 **/
router.post('/editChemical', async (req,res)=>{
	// 有下拉框搜索选择
	try{
		let { editForm,type} = req.body
	
		//处理一下这个数组
	
		if(type==='add'){
			let addForm = editForm.chemicalInfo
						console.log(addForm)
			addForm.forEach(item=>{
				item.major_unit = editForm.major_unit
				delete item.key
			})

		  await MajorHazard.insertMany(addForm)
	    res.send({meta:{msg:"添加或修改化学品信息成功",err:0}})
		}
		//  await MajorHazard.updateMany({major_unit},editForm,{upsert:true})
		return
	}
	catch(e){
		console.log(e);
		res.send({meta:{msg:"添加或修改化学品信息成功",err:-1}})
		return;
	}
})


/**
 * @api {post} /hazard/deleteChemical 删除化学品存储信息
 * @apiGroup Hazard
 **/
 router.delete('/deleteChemical',(req,res)=>{
	 let {deleteData,type} = req.query
	 console.log(deleteData,type)
 })
 
module.exports = router