const express = require('express')
const router = express.Router()

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
				{id:23,name:'组织机构与责任制',path:'orgnization'},
				{id:24,name:'管理制度',path:'manage'},
				{id:25,name:'人员培训教育',path:'education'}
			]
		},
		{
			id:3,
			name:'风险管理',
			path:'risk',
			children:[
				{id:31,name:'重大危险源判断',path:'majorHazard'},
				{id:32,name:'风险评估',path:'hazardAssess'}
			]
		},
		{
			id:4,
			name:'企业评分',
			path:'grade',
			children:[
				{id:41,name:'填写打分表',path:'fillTable'},
				{id:42,name:'查看打分情况',path:'getScore'},
				{id:43,name:'导入评分表',path:'dataset'}
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

module.exports = router