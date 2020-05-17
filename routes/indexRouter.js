const express = require('express')
const router = express.Router()
const Role = require('../db/models/rolesModel')
const Power = require('../db/models/powersModel')
//获取左侧菜单
router.get('/menus',(req,res)=>{
	let menu = [
		{
			id:1,
			name:'个人管理',
			path:'users',
			children:[
				{id:11,name:'账号与安全',path:'account'},
				{id:12,name:'邮箱验证',path:'vertifyEmail'}
			]
		},
		{
			id:2,
			name:'档案管理',
			path:'archives',
			children:[
				{id:21,name:'危险化学品管理',path:'chemicals'},
				{id:22,name:'法律法规标准规范',path:'laws'},
				{id:23,name:'作业安全证',path:'orgnization'},
			]
		},
		{
			id:3,
			name:'风险管理',
			path:'risk',
			children:[
				{id:31,name:'重大危险源判断',path:'majorHazard'},
				{id:32,name:'风险评估',path:'hazardAssess'},
				{id:33,name:'自定义安全计划表',path:'hazardAssess'}
			]
		},
		{
			id:4,
			name:'企业评价',
			path:'grade',
			children:[	
				{id:41,name:'填写评分表',path:'fillTable'},
				{id:42,name:'查看填写状态',path:'getFillStatus'},
				{id:43,name:'导出企业评价内容',path:'getEvaluateContent'}, //specific fill status
				{id:44,name:'查看评分结果',path:'getScore'}, //last score
				{id:45,name:'导入评价表',path:'importEvaluateTable'}, 
				{id:46,name:'导出评价文档',path:'exportEvaluateDoc'} //word
			]
		},
		{
			id:5,
			name:'管理员设置',
			path:'manager',
			children:[
				{id:51,name:'用户列表',path:'usersList'},
				{id:52,name:'权限列表',path:'roleList'},
				{id:53,name:'用户账户管理',path:'accountManage'}
			]	
		}
	]
   res.send({meta:{err:0,msg:'get muneList ok'},menu})
})


router.get('/getMenuList',async (req,res)=>{
	try{
		let {roleId} = req.query
		let temp = Role.find({role_id:roleId},{_id:0,role_powers:1})
		let powers = temp[0].role_powers.split(',')
		let list = await Power.find({},{_id:0},{lean:true}).sort({power_level:1})

		res.send({menu:first,meta:{err:0,msg:'返回目录列表数据成功'}})
	}
	catch(e){
		console.log(e)
		res.send({meta:{err:-1}})
	}
})

module.exports = router