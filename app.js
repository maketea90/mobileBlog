var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const cors = require('cors')
const nodemailer = require("nodemailer")
require('dotenv').config()
const auth = require('./middleware/auth')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(process.env.MONGO_URL);

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled
}

var app = express();

app.use(cors())


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


// async..await is not allowed in global scope, must use a wrapper

  // send mail with defined transport object

  // console.log("Message sent: %s", info.messageId);
  // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  // import {SMTPClient}  from 'emailjs';

  // function sendEmail({recipient_email, OTP}) {
  //   const client = new SMTPClient({
  //     user: process.env.MY_EMAIL,
  //     password: process.env.MY_PASSWORD,
  //     host: 'smtp.ethereal.email',
  //     ssl: true,
  //   });
    
  //   // send the message and get a callback with an error or details of the message that was sent
  //   client.send(
  //     {
  //       text: `i hope this works ${OTP}`,
  //       from: process.env.MY_EMAIL,
  //       to: recipient_email,
  //       cc: '',
  //       subject: 'testing emailjs',
  //     },
  //     (err, message) => {
  //       console.log(err || message);
  //     }
  //   );
  // }


 function sendEmail({ recipient_email, OTP }) {
  

  const transporter = nodemailer.createTransport({
    // host: 'smtp.zoho.eu',
    // port: 465,
    // secure: true,
    service: 'fastmail', // true for port 465, false for other ports
    auth: {
      user: process.env.MY_EMAIL,
      pass: process.env.MY_PASSWORD,
    },
  });

   
  return new Promise((resolve, reject) => {
    const mail_configs = {
      from: process.env.MY_EMAIL, // sender address
      to: recipient_email, // list of receivers
      subject: "Joe's blog app OTP", // Subject line
      text: `${OTP}`, // plain text body
      html: `<b>${OTP}</b>`, // html body
    };

    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        console.log(error);
        // console.log(info)
        return reject({ message: `An error has occured` });
      }
      console.log(info)
      return resolve({ message: "Email sent succesfully" });
    });
  })
  

   
  ;
}

app.post("/send_recovery_email", auth,(req, res) => {
  sendEmail(req.body)
    .then((response) => res.send(response.message))
    .catch((error) => res.status(500).send(error.message));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
