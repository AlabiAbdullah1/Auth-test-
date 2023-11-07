const User = require("../model/user");
const jwt = require("jsonwebtoken");
const cookie = require("cookie-parser");
const transporter = require("../email");
const sendEmail = require("../email");
const crypto = require("crypto");

// handle errors:
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = {
    name: "",
    email: "",
    password: "",
    passwordconfirm: "",
    randomerr: "",
  };

  // Incorrect Email:
  if (err.message === "Incorrect Email") {
    errors.email = "That email is not registered";
  }

  // Incorrect Password:
  if (err.message === "Incorrect password") {
    errors.password = "That password is incorrect";
  }

  // If password does not match:
  if (err.message === "Password not match!") {
    errors.passwordconfirm = "Your password does not match!";
  }

  //

  if (err.message === "Email does not exist!") {
    errors.email = "Email does not exist!";
    return errors;
  }

  // Duplicate Error Code:
  if (err.code === 11000) {
    errors.email = "This Email already exists!";
    // return errors
  }
  // validation errors:
  if (err.message.includes("user validation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

// // JWT:
//     const maxAge= 3*24*60*60 //3 Days:
//     const forgetMax=3*60*60
//     const createToken= (id)=>{
//         return jwt.sign({ id}, 'secret license', {
//             expiresIn: maxAge
//         });
//     }

//     // NB: 'secret license' is like my jwt password

// module.exports.signup_get= function(req, res){
//     res.render('signup')
// }

// module.exports.login_get= function(req, res){
//     res.render('login')
// }

// module.exports.signup_post= async function(req, res){
//     const {username, email, password} =req.body
//     try{
//        const user= await User.create({username,email, password});
//        const token= createToken(user._id)
// store the token in a cookie:
//        res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge *1000})
//        res.status(200).json({user: user._id});
//     }
//     catch(err){
//        const errors=  handleErrors(err)
//         res.status(400).json({errors})
//     }
// }

// module.exports.login_post=async function(req, res){
//     const { email, password} = req.body;
//     try {
//         const user= await User.login(email,password);
//         const token= createToken(user._id)
//         res.cookie('jwt', token, {httpOnly: true, maxAge: maxAge *1000})
//         res.status(200).json({user: user._id})
//     } catch (err) {
//         const errors=handleErrors(err)
//         res.status(400).json({errors})
//     }
// }

// module.exports.logout_get=(req, res)=>{
//     res.cookie('jwt', '', {maxAge: 1 });
//     res.redirect('/')
// }

// module.exports.forgetpassword_get= (req, res)=>{
//     res.render('forget');
// }

// module.exports.resetpassword_post= (req, res)=>{
//     const email=req.body.email;
//     // check if the email entered is in the db
//     User.findOne({email}), (err, result)=>{
//         if(err){
//             console.log('')
//         }
//         if(result){
//             const token= jwt.sign({email}, 'secret license', {
//                 expiresIn:forgetMax
//             })
//             sendEmail(email, token)
//         }else{
//             res.status(400).send('User not found');
//         }
//     }
//     function sendEmail(email, token){
//         const mailOption={
//             from:'sikeabdulnig@gmail.com',
//             to:email,
//             subject:'Passwoerd reset Request',
//             text: `${req.url}/resetpassword/${token}`
//         }
//         transporter.sendEmail(mailOption, (error, info)=>{
//             if(error){
//                 console.log(error);
//             }else{
//                 console.log('Email sent' + info.res)
//             }
//         })
//     }
//     res.status(200).json(token)
// }

// jwt:

exports.getAllusers = async (req, res) => {
  const users = await User.find();
  res.status(200).json({
    users,
  });
};

exports.login_get = (req, res) => {
  res.status(200).send("Hello!");
};

exports.signup_post = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const maxAge = 3 * 24 * 60 * 60;
    const token = jwt.sign({ id: user._id }, "SecretLicense", {
      expiresIn: maxAge,
    });

    res.status(201).json({
      data: {
        token: token,
        newUser: user,
      },
    });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

exports.login_post = (req, res) => {
  const { name, email, password } = req.body;

  // Check if name, email, password exists:
  try {
    const loginError = User.loginerror(name, email, password); //static method inside my schema;
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

  // Check if user exist&& password is correct

  try {
    const user = User.login(email, password); // Static method inside of my schema
    const maxAge = 3 * 24 * 60 * 60;
    const token = jwt.sign({ id: user._id }, "SecretLicense", {
      expiresIn: maxAge,
    });
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

  // if everything is okay, send token to client:
  const token = "";
  res.status(200).json({
    token,
    data: "Success",
  });
};

// forgot password:

exports.forgotpassword_post = async (req, res, next) => {
  try {
    // et user based on posted email
    const email = req.body.email;

    const user = await User.findOne({ email });
    if (!user) {
      throw Error("Email does not exist!");
      next();
    }

    const resetToken = User.createResetToken();
   await user.save({validateBeforeSave: false});


// send token back to user:
    const resetURL= `${req.protocol}://${req.get('host')}/resetpassword/${resetToken}`
    const message= `We have received a password reset request please use the below link to reset your password\n\n ${resetURL}\n\n
    This reset password link will only be valid for 10 mins`
    await sendEmail({
      email:user.email,
      subject:"Password Reset Token",
      message:message
    })
    res.status(200).json({
      status:'Success',
      message:"Password Reset link sent to user's email"
    })

    
    user.passwordResetToken=undefined
    user.passwordResetTokenExpires= undefined
  }   
    catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

exports.resetpassword_patch=async (req, res)=>{
  try{
  const token=crypto.createHash('sha256').update(req.params.token).digest('hex')
  const user= await User.findOne({passwordResetToken:token, passwordResetTokenExpires:{$gt: Date.now()}})
  console.log( passwordResetTokenExpires   )

  if(!user){
    throw Error("Token is invalid or expired!")
  }

  user.password = req.body.password
  user.passwordconfirm= req.body.passwordconfirm
  user.passwordResetToken=undefined
  user.passwordResetTokenExpires= undefined
  user.passwordChangedat= Date.now()

  await user.save()

  // Login the USer:
  const maxAge = 3 * 24 * 60 * 60;
  const tokenn = jwt.sign({ id: user._id }, "SecretLicense", {
    expiresIn: maxAge,
  });
  res.cookie("jwt", tokenn, { httpOnly: true, maxAge: maxAge * 1000 });
  res.status(200).json({ user: user._id });


}catch(err){
  const errors= handleErrors(err)
  res.status(400).json({errors})
}

}