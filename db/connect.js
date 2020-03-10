const mongoose = require('mongoose')
//=========连接数据库============
mongoose.connect('mongodb://localhost/ems_db',{ useNewUrlParser: true, useUnifiedTopology: true });
//connect() 返回一个状态待定（pending）的连接

//=====成功提醒和失败警告=========
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
	console.log('db ok')
});
