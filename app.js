var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
// const bodyparser = require('body-parser') //用来解析请求体
var logger = require('morgan');
var cors = require("cors"); //  cnpm install cors
const db = require('./db/connect')

//静态目录

var app = express();

//要想从服务器上访问必须要设置静态目录
app.use('/public',express.static(path.join(__dirname,'./public')))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false })); //这里直接用的express
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyparser.urlencoded({extented:false})) //require body-parser 模块
// app.use(bodyparser.json())//解析json
app.use(cors());


//router 
var hazardRouter = require('./routes/hazardRouter')
var archivesRouter = require('./routes/archivesRouter')
var usersRouter = require('./routes/usersRouter')
var indexRouter = require('./routes/indexRouter')
var rolesRouter = require('./routes/rolesRouter')
var gradeRouter = require('./routes/gradeRouter')

app.use('/index',indexRouter);
app.use('/archives', archivesRouter);
app.use('/users', usersRouter);
app.use('/roles',rolesRouter);
app.use('/grade',gradeRouter);
app.use('/hazard',hazardRouter);


app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});



module.exports = app;
