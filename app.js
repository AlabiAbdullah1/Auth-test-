const express = require('express');
const mongoose = require('mongoose');
const authRoute= require('./route/authrouter');
const cookieParser= require('cookie-parser');

const app = express();

// middleware
app.use(express.static('public'));
// This middleware takes any json request made and pass it to be a JS :
app.use(express.json())
// use cookieParser
app.use(cookieParser())

app.use(express.urlencoded({extended:false}))


// view engine
app.set('view engine', 'ejs');

// database connection
const dbURI = 'mongodb://127.0.0.1:27017/Authorizaion'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => app.listen(3000))
  .catch((err) => console.log(err));


app.use(authRoute)

// // COOKIES(Testing):

// app.get('/set-cookies', (req, res)=>{
//   // res.setHeader('set-cookie', 'newUSer= true');
//   res.cookie('isEmployee', true, {maxAge: 1000*60*60*24, httpOnly: true})
//   res.send('You got the cookie!')
// })

// app.get('/read-cookies', (req, res)=>{
//   const cookies= req.cookies
//   console.log(cookies)

//   res.json(cookies);
// })

