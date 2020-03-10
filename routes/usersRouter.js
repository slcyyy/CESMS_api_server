const express = require('express')
const router = express.Router()
const User = require('../db/models/usersModel')
const Role = require('../db/models/rolesModel')
//{send:[Function:send]}
const Mail = require('../utils/mail')
const jwt = require('jsonwebtoken')

let codes = {} //通过内存保存验证码信息,每一次重新启动时都会清空

//test
router.post('/test',async (req,res)=>{
	let a =[{te:'32'},{te:'32'},{te:'32'},{te:'32'},{te:'32'}]
	a[0].gender = "ndsa"
	
	let b=[]
	//Unhandled promise rejections are deprecated
	b =a 
	let t =[]
 const doc = await User.find({});
 for (let i = 0; i < doc.length; i++) {
	t.push({
		_id:doc[i]._id,
		name:doc[i].user_name,
		new:'fsd'
	})
	}
	res.send(t)
})

/**
 * @api {get} /user/:name/:pwd/:email/:code Sign up
 * @apiName Register
 * @apiGroup User
 * 
 * @apiParam {String} name Users name.
 * @apiParam {String} pwd Users password.
 * @apiParam {String} email Users unique email.
 * @apiParam {String} roleId Users role.
 * @apiParam {String} code Users code.
 * 
 */
router.post('/regist',(req,res)=>{
	let {name,email,pwd,role,code} = req.body
	if(!email || !pwd || !name || !code || !role) return res.send({err:-1,msg:'注册参数传递错误'})
	/*
		es6中假如key和value值是一样的,可以简化:
		{us:us,ps:ps} === {us,ps}
		*/
	 // console.log(typeof(code)) String
	// console.log(typeof(codes[email])) number
	if(codes[email] != code){
		 return res.send({err:-1,msg:'验证码错误'})
	}
	User.insertMany({user_name:name,user_email:email,user_pwd:pwd,user_authority})
	.then((data)=>{
		res.send({err:0,msg:'register ok'})
	})
	.catch((err)=>{
		res.send({err:0,msg:'注册插入数据失败'})
   })
})
/**
 * @api {get} /user/:email/:pwd Sign in
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} email Users unique email.
 * @apiParam {String} pwd Users password.
 * 
 */
router.post('/login',(req,res)=>{
	let {id,pwd} = req.body
	if(!id || !pwd ) return  res.send({err:-1,msg:'登录参数传递错误'})
	// if(codes[email] != code){
	// 	 return res.send({err:-1,msg:'验证码错误'})
	// }
	
 //判断邮箱和密码是否正确
	User.find({user_id:id,user_pwd:pwd})
	.then((data)=>{
		//data是一个数组类型
    if(data.length>0){
			let payload = {id,pwd}
			let secret = 'EditByLuo'
			let token = jwt.sign(payload,secret)
			console.log(token)
			res.send({meta:{err:0,msg:'login ok'},id,token})
		}
		else{
			 res.send({meta:{err:-1,msg:'email or pwd is wrong'}})
		}
	})
	.catch((err)=>{
		console.log('登录内部错误')
	})
})

//send mail 是一个ajax接口
router.post('/getMailCode',(req,res)=>{
	let {email} = req.body
  let code = Math.floor(Math.random()*(9999-1000))+1000; //取整,math.random从0到1
  console.log(code)
	codes[email] = code //全局的
	console.log(codes)
 //封装成一个promise对象,因为是异步操作,不然没法判断
	Mail.send(email,code)
	.then((msg)=>{
		res.send(msg)
	})
	.catch((err)=>{
		res.send(err)
	})
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
			if (err) return console.log(err)
			total = count
		});
		User.find(query,{user_id:1,user_name:1,user_roleId:1,user_state:1,_id:0}).limit(Number(pageSize)).skip(Number((pageNum-1)*pageSize))
		.then((users)=>{
			for(i=0;i<users.length;i++){
				data.push({
					_id:users[i]._id,
					user_id:users[i].user_id,
					user_name:users[i].user_name,
					user_state:users[i].user_state,
			    user_roleName:""
				})
				for(j=0;j<roles.length;j++){
					let t = users[i]['user_roleId'].indexOf(((String)(roles[j]['role_id'])))
					if(t>-1){
						//用了.就不用中括号不用单引号不用点 就要用中括号和单引号,a[1].province="Jiangsu"这样是添加不了的
						if(data[i]['user_roleName']==""){
							data[i]['user_roleName'] = roles[j]['role_name']
						}
						else{
							data[i]['user_roleName'] += ","+roles[j]['role_name']
						}
					}
				}
			}
			console.log(data)
			 res.send({pageSize,pageNum,total,data,meta:{err:"0",msg:"获取用户列表成功"}})
		})
		.catch(err=>{
			console.log(err)
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

//用户状态更改
router.put('/stateChange',(req,res)=>{
   let {user_id,user_state} = req.body
	 console.log(user_id,user_state)
	 let newState = !user_state
	 User.update({user_id},{user_state:newState},(err,raw)=>{
		 if(err) return res.send({meta:{err:-1,msg:'修改状态失败'}})
		 res.send({user_id,newState,meta:{err:0,msg:'修改状态成功'}})
	 })
})

//添加用户
router.post('/addUser',(req,res)=>{
	let {user_id,user_name,user_pwd,user_email,user_roleId} = req.body
	//res.send之后还是会继续执行
	
	User.find({user_id})
	.then((data)=>{
		if(data.length>0){
		  return res.send({meta:{err:-2,msg:'该工号ID已注册'}})
	  }
		else{
			User.insertMany({user_id,user_name,user_pwd,user_email,user_roleId})
			.then((data)=>{
				res.send({meta:{err:0,msg:'添加用户成功'}})
			})
			.catch((err)=>{
				console.log(err)
				res.send({meta:{err:-1,msg:'添加用户失败'}})
			 })
		}
	})
	.catch((err)=>{
		console.log(err)
		res.send({meta:{err:-1,msg:'查询是否注册用户失败'}})
	 })
})

//根据用户id查询
router.get('/getUserById',(req,res)=>{
	console.log(req.query)
	let {user_id} = req.query
	console.log(user_id)
	User.find({user_id},{user_id:1,user_name:1,user_roleId:1,user_state})
	.then((data)=>{
		let query = data[0]
		console.log(query)
		res.send({query,meta:{err:0,msg:'id查询用户成功'}})
	})
	.catch((err)=>{
		res.send({meta:{err:-1,msg:'id查询用户失败'}})
	})
})

router.delete('/deleteUser',(req,res)=>{
	let {user_id} = req.body
	User.deleteMany({user_id})
	.then((data)=>{
		res.send({meta:{msg:'删除用户成功',err:0}})
	})
	.catch((err)=>{
		console.log(err)
		res.send({meta:{msg:'删除用户失败',err:-1}})
	})
})
module.exports=router