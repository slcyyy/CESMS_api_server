const express = require('express')
const router = express.Router()
const Role = require('../db/models/rolesModel')
const Power = require('../db/models/powersModel')

router.get('/getRoleList', async (req, res) => {
	await Role.find({},{_id:0})
	.then((data) => {
			res.send({data,meta: {err: "0",msg: "获取角色列表成功"}})
		})
		.catch((err) => {
			res.send({meta: {err: "-1",msg: "获取角色列表失败"}})
		})
})

router.get('/getRoleById', (req, res) => {
	let {role_id} = req.query
	Role.find({role_id}, {role_name: 1,role_desc: 1,role_powers: 1,_id:0})
		.then((data) => {
			let query = data[0] //因为得到的是一个{[]}类型
			res.send({query,meta: {err: "0",msg: "id查询角色成功"}})
		})
		.catch(err => {
			res.send({meta: {err: "-1",msg: "id查询角色失败"}})
		})
})

router.get('/getPowersTree', async (req, res) => {
	let {powers} = req.query
	console.log(powers)
	try {
		let powerList = await Power.find({
			power_level: 0,
		}, {
			power_id: 1,
			power_name: 1,
			power_level: 1,
			_id: 0
		}, {
			lean: true
		})
		let second = await Power.find({
			power_level: 1
		}, null, {
			lean: true
		})
		for (let i = 0; i < powerList.length; i++) {
			powerList[i]['children'] = []
			for (let j = 0; j < second.length; j++) {
				if (second[j]['power_pId'] == powerList[i]['power_id']) {
					powerList[i]['children'].push(second[j])
				}
			}
		}
		let third = await Power.find({
			power_level: 2
		}, null, {
			lean: true
		})
		for (let i = 0; i < powerList.length; i++) {
			for (let j = 0; j < (powerList[i]['children']).length; j++) {
				powerList[i]['children'][j]['children'] = []
				for (let k = 0; k < third.length; k++) {
					if (third[k]['power_pId'] == powerList[i]['children'][j]['power_id']) {
						powerList[i]['children'][j]['children'].push(third[k])
					}
				}
			}
		}
		
		res.send({
			powerList,
			meta: {
				err: "0",
				msg: "获取树形权限成功"
			}
		})
	} catch (err) {
		console.log(err)
		res.send({
			meta: {
				err: "-1",
				msg: "获取树形权限失败"
			}
		})
	}
})



router.get('/getPowersLeafTreeById', async (req, res) => {
	let {role_id,role_powers} = req.query
	try {
		let role = new RegExp(role_id)
		let query1 = {power_level: 0,power_pRoleId: role}
		//查询哪些第一级权限(menu)是该用户所有
		let powerList = await Power.find(query1, {
			power_id: 1,
			power_name: 1,
			power_level: 1,
			_id: 0
		}, {
			lean: true
		})

		//查询第二级权限
		//不加true又输出Undefin哦
		let second = await Power.find({
			power_level: 1
		}, null, {
			lean: true
		})
		for (let i = 0; i < powerList.length; i++) {
			powerList[i]['children'] = []
			for (let j = 0; j < second.length; j++) {
				if (second[j]['power_pId'] == powerList[i]['power_id']) {
					powerList[i]['children'].push(second[j])
				}
			}
		}
		//查询第三级权限
		let third = await Power.find({
			power_level: 2
		}, null, {
			lean: true
		})
		for (let i = 0; i < powerList.length; i++) {
			for (let j = 0; j < (powerList[i]['children']).length; j++) {
				powerList[i]['children'][j]['children'] = []
				for (let k = 0; k < third.length; k++) {
					if (third[k]['power_pId'] == powerList[i]['children'][j]['power_id']) {
						powerList[i]['children'][j]['children'].push(third[k])
					}
				}
			}
		}
    let leafList = []
    for (let i = 0; i < powerList.length; i++) {
    	for (let j = 0; j < (powerList[i]['children']).length; j++) {
        if (powerList[i]['children'][j]['children'].length == 0) {
    			if(role_powers.indexOf(powerList[i]['children'][j]['power_id'],0)>-1)
    				leafList.push(powerList[i]['children'][j]['power_id'])
    		} else {
    			for (let k = 0; k < (powerList[i]['children'][j]['children']).length; k++) {
    				if (role_powers.indexOf(powerList[i]['children'][j]['children'][k]['power_id'],0)>-1)
    					leafList.push(powerList[i]['children'][j]['children'][k]['power_id'])
    			}
    		}
    	}
    }	
		res.send({
			leafList,
			meta: {
				err: "0",
				msg: "获取树形权限成功"
			}
		})
	} catch (err) {
		console.log(err)
		res.send({
			meta: {
				err: "-1",
				msg: "获取树形权限失败"
			}
		})
	}
})

router.post('/addRole',async (req,res)=>{
	try{
		let {addForm} = req.body
		console.log(addForm)
		await Role.insertMany(addForm)
		res.send({meta:{err:0,msg:"添加角色信息成功"}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1,msg:"添加角色信息失败"}})
	}
})

router.delete('/deleteRole',async (req,res)=>{
  try{
		let {role_id} = req.query
		await Role.deleteMany({role_id})
		res.send({meta:{msg:'删除角色成功',err:0}})
  } 
	catch(err){
		res.send({meta:{msg:'删除角色失败',err:-1}})
	}
})

router.put('/editRole',async (req,res)=>{
	try{
		let {editForm} = req.body
    console.log(editForm)
		await Role.updateOne({role_id:editForm.role_id},{
			role_name:editForm.role_name,
			role_desc:editForm.role_desc
			})
		res.send({meta:{err:0,msg:"修改角色信息成功"}})
	}
	catch(err){
		console.log(err)
		res.send({meta:{err:-1,msg:"修改角色信息失败"}})
	}
})

router.put('/savePowers',(req,res)=>{
	let {role_id,keys} = req.body
	console.log(keys)
	Role.update({role_id},{role_powers:keys},(err,raw)=>{
		if(err) return res.send({meta:{err:-1,msg:'修改角色权限失败'}})
		res.send({raw,meta:{err:0,msg:'修改角色权限成功'}})
	})
})
module.exports = router
