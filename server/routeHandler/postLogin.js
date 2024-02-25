const bcrypt = require("bcrypt")
const User = require("../models/user")

module.exports.postLogin = async (req, res, next) => {
  
  try {
    const {email, password} = req.body
    const userCheck = await User.findOne({ email })
    if (!userCheck) {
      return res.json({ msg: 'Account doesn\'t exist!', status: false })
    }
    const passwordCheck = await bcrypt.compare(password, userCheck.password)
    if(!passwordCheck){
      return res.json({ msg: 'Password is wrong!', status: false })
    }
    
    // delete userCheck.password
    // req.session.user = userCheck
    // return res.json({status: true, user: userCheck})  

    const userObject = userCheck.toObject(); 
    delete userObject.password
    req.session.user = userObject
    return res.json({status: true, user: userObject})  

  } catch (error) {
    console.error('Error during password or email check when login:', error)
    next(error)  //  need an error-handling middleware 
  }
}