const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "please input your name"],
    unique: false,
  },

  email: {
    type: String,
    required: [true, "Please Enter an Email"],
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please Enter a password"],
    minlength: [8, "Minimum password length is 8 characters"],
    // select:false
  },
  passwordconfirm: {
    type: String,
    required: [true, "password does not match"],
    validate: {
      validator: function (el) {
        if (el === this.password) console.log("Success");
        else {
          throw Error("Password not match!");
        }
      },
    },
  },
  passwordChangedat:{
    type:Date
  },
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
});

this.passwordChangedat= Date.now()

userSchema.pre("save", async function (next) {
  // if (!this.isModified("password")) 
  // return next();
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordconfirm = undefined;
  next();
});

userSchema.statics.loginerror = (name, email, password) => {
  if ((!name, !email, !password)) {
    throw Error("User does not exist");
  }
};

userSchema.statics.user = (email) => {
  const user = User.findOne(email);
  if (!user) {
    throw Error("Email does not exist!");
  }
};

userSchema.statics.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  // encrypt the resetToken

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");     

  // paaswordReset Expires
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(this.passwordResetExpires)

  console.log(resetToken, this.passwordResetToken)
  return resetToken;
  return this.passwordResetExpires;
  return this.passwordResetToken
};

const User = mongoose.model("user", userSchema);

module.exports = User;
