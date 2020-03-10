var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
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
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//解决跨域问题
// app.use(cors({
// 　　methods: ["GET", "POST","PUT","DELETE"],
// 　　alloweHeaders: ["Content-Type", "application/json;charset=utf-8;application/x-www-form-urlencoded"]
// }));
// app.all('*',function (req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
//   res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');

//   if (req.method == 'OPTIONS') {
//     res.send(200); /让options请求快速返回/
//   }
//   else {
//     next();
//   }
// });
app.use(cors());


//router 
var archivesRouter = require('./routes/archivesRouter')
var usersRouter = require('./routes/usersRouter')
var indexRouter = require('./routes/indexRouter')
var rolesRouter = require('./routes/rolesRouter')
var gradeRouter = require('./routes/gradeRouter')

app.use('/index',indexRouter);
app.use('/archives', archivesRouter);
app.use('/users', usersRouter);
app.use('/roles',rolesRouter);
app.use('/grade',gradeRouter)


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
