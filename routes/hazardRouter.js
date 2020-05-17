var express = require('express');
var router = express.Router();
const Unit = require('../db/models/unitModel')
const ChemiStorage = require('../db/models/chemiStorageModel')
const HazardStep = require('../db/models/hazardStepModel')
const HazardTask = require('../db/models/hazardTaskModel')

//==========危险化学品重大危险源辨识===============

/**
 * @api {get} /hazard/getIdentifyResult 返回辨识结果
 * @apiGroup Hazard
 **/
 router.get('/IdentifyResult',async (req,res)	=>{
	 try{
		 var identifyResult=[];
		 let unitOptions = []
		 let {query} = req.query
		 //根据传入的区域ID
		 if(query!=''&& query!=null){
			 identifyResult = await ChemiStorage.find({chemi_unitId:query},{_id:0,chemi_β:0}).sort({chemi_unitId:1}) 
			 identifyResult.sort(function(a,b){
				 if(a.chemi_unitId == b.chemi_unitId){
					  return (a.chemi_name).localeCompare(b.chemi_name)
			   }
		   })
		 }
		 else{
			 identifyResult = await ChemiStorage.find({},{_id:0}).sort({chemi_unitId:1})
			 identifyResult.sort(function(a,b){
			 	if(a.chemi_unitId == b.chemi_unitId){
			 	   return (a.chemi_name).localeCompare(b.chemi_name)
			  }
			 })
	   }
		 unitOptions = await Unit.find({},{_id:0,unit_id:1,unit_name:1,unit_isRisk:1,unit_S:1}).sort({unit_id:1})
		 res.send({identifyResult,unitOptions,meta:{err:0,msg:'查询辨识结果成功'}})
		 return;
	 }
	 catch(e){
     res.send({meta:{err:-1}})		 
		 return
	 }
 })

 /**
  * @api {post} /hazard/editMajor 修改化学品存储信息和重大危险源信息
  * @apiGroup Hazard
  **/
 router.post('/editMajor',async (req,res)=>{
	 try{
		let {editForm,unitInfo} = req.body
		//处理数据
		let form = editForm.chemicalInfo
		form.forEach(item=>{
			item.chemi_unitId = editForm.chemi_unitId
			delete item.key
		})
		//删除掉原来的数据重新添加
		await ChemiStorage.deleteMany({chemi_unitId:editForm.chemi_unitId})
		await ChemiStorage.insertMany(form)
		//修改单元的危险源信息
		await Unit.update({unit_id:unitInfo.unit_id},{unit_isRisk:unitInfo.unit_isRisk,unit_S:unitInfo.unit_S})
    res.send({meta:{err:0,msg:'修改化学品存储成功'}})
	 }
	catch(e){
		console.log(e)
		res.send({meta:{err:-1,msg:'修改失败'}})
	} 
 })
 
 
 /**
  * @api {post} /hazard/editChemiStorage 添加单元是否为重大危险源信息
  * @apiGroup Hazard
  **/
	router.post('/editUnitRisk ',async (req,res)=>{
	 try{
		 let {newUnit} = req.body
		 for(let i=0;i<newUnit.length;i++){
		 	await Unit.update({},{unit_isRisk:newUnit[i].unit_isRisk})
		 }
		 res.send({meta:{err:0}})
	 }	
	 catch(e){
		 console.log(e)
		 res.send({meta:{err:-1}})
	 }
	})
	
	//==============重大危险源分级分级===============

	
	router.get('/classifyResult',async (req,res)=>{
		try{
			var classifyResult=[];
			let unitOptions = []
			let {query} = req.query
			unitOptions = await Unit.find({unit_isRisk:1},{_id:0,unit_id:1,unit_name:1,unit_isRisk:1,unit_α:1,unit_R:1},{lean:true}).sort({unit_id:1})
			//是重大危险源的单元ID
			let riskUnitId= []
			unitOptions.forEach(item=>{
				let temp = {chemi_unitId:item.unit_id}
				riskUnitId.push(temp)
			})
			//根据传入的区域ID
			if(query!=''&& query!=null){
				classifyResult = await ChemiStorage.find({chemi_unitId:query,$or:riskUnitId},{_id:0}).sort({chemi_unitId:1}) 
				classifyResult.sort(function(a,b){
					if(a.chemi_unitId == b.chemi_unitId){
						return (a.chemi_name).localeCompare(b.chemi_name)
					}
			  })
		  }
			else{
			  classifyResult = await ChemiStorage.find({$or:riskUnitId},{_id:0}).sort({chemi_unitId:1})
			  classifyResult.sort(function(a,b){
					if(a.chemi_unitId == b.chemi_unitId){
						return (a.chemi_name).localeCompare(b.chemi_name)
					}
		    })
		  }
				 res.send({classifyResult,unitOptions,meta:{err:0,msg:'查询辨识结果成功'}})
				 return;
		}
		catch(e){
		  res.send({meta:{err:-1}})		 
				 return
		}
	})
	
	//修改分级信息
	router.post('/editClassify',async (req,res)=>{
		 try{
			let {editForm,unitInfo} = req.body
			//处理数据
			let form = editForm.chemicalInfo
			form.forEach(item=>{
				item.chemi_unitId = editForm.chemi_unitId
			})
			//删除掉原来的数据重新添加
			await ChemiStorage.deleteMany({chemi_unitId:editForm.chemi_unitId})
			await ChemiStorage.insertMany(form)
			//修改单元的分级信息
			console.log(unitInfo.unit_α,unitInfo.unit_R)
			await Unit.update({unit_id:unitInfo.unit_id},{unit_α:unitInfo.unit_α,unit_R:unitInfo.unit_R})
	   res.send({meta:{err:0,msg:'修改分级信息成功'}})
		 }
		catch(e){
			console.log(e)
			res.send({meta:{err:-1,msg:'修改失败'}})
		} 
	})
  //========================风险评估========================
//获取所有的任务数据用以下拉框
	router.get('/getTask',async (req,res)=>{
		try{
			let task = await HazardTask.find(null,{_id:0})
			res.send({task,meta:{err:0}})
		}catch(e){
			res.send({meta:{err:-1}})
		}
	})
	
 /**
  * @api {get} /hazard/assessResult 返回评估结果
  * @apiGroup Hazard
  **/
 router.get('/assessResult',async (req,res)=>{
	 try{
	 		 var assessResult=[];
	 		 let {query} = req.query
			 //query是任务ID
	 		 if(query!=''&& query!=undefined){
	 			 assessResult= await HazardStep.find({hazard_taskId:query},{_id:0}).sort({hazard_taskId:1}) 
				 //按照步骤顺序排序
				 assessResult.sort(function(a,b){
				 	 if(a.hazard_taskId === b.hazard_taskId)
				 	    return a.hazard_stepId-b.hazard_stepId
				 });
	 		 }
	 		 res.send({assessResult,meta:{err:0}})
	 		 return;
	 }
	 catch(e){
	 		 console.log(e)
	   res.send({meta:{err:-1}})		 
	 		 return
	 }
 })
 
 /**
  * @api {get} /hazard/deleteStep 删除任务
  * @apiGroup Hazard
  **/
	router.delete('/deleteStep',async (req,res)=>{
	  try{
			let {hazard_taskId,hazard_stepId,hazard_stepName,type} = req.query
			if(type==1)
			  await HazardTask.deleteOne({hazard_taskId})
			await HazardStep.deleteOne({hazard_taskId,hazard_stepId,hazard_stepName})
			res.send({meta:{msg:'删除任务信息成功',err:0}})
	  } 
		catch(err){
			res.send({meta:{msg:'删除任务信息失败',err:-1}})
		}
	})
	
	
	
	/**
	 * @api {post} /hazard/addTask 添加任务信息
	 * @apiGroup Hazard
	 **/
	router.post('/addTask', async (req,res)=>{
		// 有下拉框搜索选择
		try{
			let {addForm,isNew} = req.body
			if(isNew){
				let task={
					hazard_taskId:addForm.hazard_taskId,
					hazard_task:addForm.hazard_task
				}
				await HazardTask.insertMany(task)
			}
				let form = addForm.children
				form.forEach(item=>{
					item.hazard_taskId = addForm.hazard_taskId
				})			   
				await HazardStep.insertMany(form)
		    res.send({meta:{msg:"添加化学品信息成功",err:0}})
				return
		}
		catch(e){
			console.log(e);
			res.send({meta:{msg:"添加或修改化学品信息成功",err:-1}})
			return;
		}
	})
	
	/**
	 * @api {post} /hazard/editStep 修改步骤信息
	 * @apiGroup Hazard
	 **/
router.post('/editStep', async (req,res)=>{
	// 有下拉框搜索选择
	try{
		let {editForm,oldStepId,oldStepName} = req.body
		console.log(oldStepId,oldStepName)
		await HazardStep.updateOne(
		{hazard_taskId:editForm.hazard_taskId,hazard_stepId:oldStepId,hazard_stepName:oldStepName},
		editForm)		 
		res.send({meta:{msg:"修改不揍信息成功",err:0}})
		return
	}
	catch(e){
		console.log(e);
		res.send({meta:{err:-1}})
			return;
		}
	})
 
module.exports = router