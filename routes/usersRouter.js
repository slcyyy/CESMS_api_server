const express = require('express')
const router = express.Router()
const User = require('../db/models/usersModel')
const Role = require('../db/models/rolesModel')
const jwt = require('jsonwebtoken')


//登录
router.post('/login',async (req,res)=>{
	try{
		let {id,pwd} = req.body
	  let info = await User.find({user_id:id,user_pwd:pwd},{_id:0,user_id:1,user_roleId:1},{lean:true})
		if(info.length>0){
			let payload = {id,pwd}
			let secret = 'EditByLuo'
			let token = jwt.sign(payload,secret)
			//用户所拥有的角色ID数组
			let role_arr = info[0].user_roleId.split(',')
			//系统内所有的角色与权限的对应信息
			let role_power = await Role.find({},{_id:0,role_powers:1,role_id:1},{lean:true})
			//该用户所拥有的权限
			let powers = ''
		  for(let j=0;j<role_arr.length;j++){
			  for(let i=0;i<role_power.length;i++){
					if(role_power[i].role_id == role_arr[j]){
						powers+=role_power[i].role_powers+','
					}
				}
			}
			let arr = powers.split(',')
			arr.pop()
			let newArr = []
			for(var i = 0;i<arr.length;i++){
			//判断newArr中是否有arr[i]这个元素，如果返回结果为-1（<0）证明新数组newArr中没有这个元素，则把元素添加到新数组中
			   if(newArr.indexOf(arr[i])<0){
			     newArr.push(arr[i]);
			   }
			}
			powers = newArr.join(',')
			res.send({meta:{err:0,msg:'login ok'},id,token,roleId:info[0].user_roleId,powers})
		}
		else{
			res.send({meta:{err:-2,msg:'email or pwd is wrong'}})
		}
	}
	catch(e){
	  console.log(e)
		res.send({meta:{err:-1}})
	}
})


//通过工号删除
router.post('/delbyID',(req,res)=>{
	let {workID} = req.body
	// 多个remove{id:[id1,id2,id3]}
	User.remove({user_id:workID})
	.then((data)=>{
		res.send({err:0,msg:'删除用户成功'})
	})
	.catch((err)=>{
		res.send({err:0,msg:'删除用户失败'})
	})
})

//修改密码
router.post('/updata',(req,res)=>{
	let {email,pwd} = req.body
	User.updateOne({user_email:email},{user_pwd:pwd})
	.then((data)=>{
		let payload = {id,pwd}
		let secret = 'EditByLuo'
		let token = jwt.sign(payload,secret)
	})
	.catch((err)=>{
		
	})
})



//分页查找用户列表
router.post('/getUserList',async (req,res)=>{
	//先执行外部再执行内部
	let query={}
	let pageSize = req.body.pageSize|| 10
	let pageNum = req.body.pageNum || 1
	let total = 0
  let data = []
	const roles = await Role.find({},{role_id:1,role_name:1,_id:0})
	
	function queryInfo(query,data){
		User.countDocuments({}, function (err, count) {
			if (err) return ;
			total = count	
		});
		User.find(query,{user_id:1,user_name:1,user_roleId:1,user_depa:1,_id:0})
		.limit(Number(pageSize))
		.skip(Number((pageNum-1)*pageSize))
		.then((users)=>{
			for(i=0;i<users.length;i++){
				data.push({
					_id:users[i]._id,
					user_id:users[i].user_id,
					user_name:users[i].user_name,
			    user_roleName:"",
					user_depa:users[i].user_depa
				})
				for(j=0;j<roles.length;j++){
					let t = users[i]['user_roleId'].indexOf(((String)(roles[j]['role_id'])))
					if(t>-1){
						if(data[i]['user_roleName']==""){
							data[i]['user_roleName'] = roles[j]['role_name']
						}
						else{
							data[i]['user_roleName'] += ","+roles[j]['role_name']
						}
					}
				}
			}
			 res.send({pageSize,pageNum,total,data,meta:{err:"0",msg:"获取用户列表成功"}})
		})
		.catch(err=>{
			 res.send({meta:{err:"-1",msg:"获取用户列表失败"}})
		})
	}
	
	if(req.body.query == ''){
		//查询数据
		queryInfo(query,data)
	}
	else{
		query['user_name'] = new RegExp(req.body.query)
		queryInfo(query,data)
	}
})


//添加用户
router.post('/addUser',(req,res)=>{
	let {user_id,user_name,user_pwd,user_depa,user_roleId} = req.body
	//res.send之后还是会继续执行
	User.find({user_id})
	.then((data)=>{
		if(data.length>0){
		  return res.send({meta:{err:-2,msg:'该工号ID已注册'}})
	  }
		else{
			User.insertMany({user_id,user_name,user_pwd,user_depa,user_roleId})
			.then((data)=>{
				res.send({meta:{err:0,msg:'添加用户成功'}})
			})
			.catch((err)=>{
				res.send({meta:{err:-1,msg:'添加用户失败'}})
			 })
		}
	})
	.catch((err)=>{
		res.send({meta:{err:-1,msg:'查询是否注册用户失败'}})
	 })
})

//根据用户id查询用户信息
router.get('/getUserById',(req,res)=>{
	let {user_id} = req.query
	User.find({user_id},{_id:0})
	.then((data)=>{
		let userInfo = data[0]
		res.send({userInfo,meta:{err:0,msg:'通过ID查询用户信息成功'}})
	})	
	.catch((err)=>{
		res.send({meta:{err:-1,msg:'id查询用户失败'}})
	})
})

//修改用户信息
router.put('/editUser',async (req,res)=>{
	try{
		let {editForm} = req.body
		await User.updateOne({user_id:editForm.user_id},editForm)
		res.send({meta:{err:0,msg:'修改用户成功'}})
	}
	catch(e){
		res.send({meta:{err:-1,msg:'修改用户失败'}})
	}
})

router.delete('/deleteUser',(req,res)=>{
	let {user_id} = req.query
	User.deleteMany({user_id})
	.then((data)=>{
		res.send({meta:{msg:'删除用户成功',err:0}})
	})
	.catch((err)=>{
		res.send({meta:{msg:'删除用户失败',err:-1}})
	})
})

//修改密码
router.put('/changePwd',async (req,res)=>{
	try{
     let {accountForm} = req.body
		 let user_id = accountForm.user_id
		 await User.updateOne({user_id},{user_pwd:accountForm.pwd})
		 res.send({meta:{err:0}})
	}
	catch(e){
		res.send({meta:{err:-1}})
	}
})

router.post('/forget',async (req,res)=>{
	try{
		let {formData} = req.body
		console.log(formData)
		let info = await User.find(formData,{_id:0,user_pwd:1}) 
	  if(info.length<1){
		   res.send({meta:{err:2,msg:'您的身份信息错误'}})
		}
		else
		   res.send({pwd:info[0].user_pwd,meta:{err:0}})
	}
	catch(e){
		res.send({meta:{err:-1}})
	}
})
module.exports=router