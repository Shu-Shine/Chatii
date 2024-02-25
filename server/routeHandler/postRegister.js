const bcrypt = require("bcrypt")
const User = require("../models/user")

module.exports.postRegister = async (req, res, next) => {
  const {username, email, password} = req.body

  try {
    const usernameCheck = await User.findOne({ username })
    if (usernameCheck) {
      return res.json({ msg: 'Username already used!', status: false })
    }

    const emailCheck = await User.findOne({ email })
    if (emailCheck) {
      return res.json({ msg: 'Email already used!', status: false })
    }
  
    const rounds = 10
    const hashPassword = await bcrypt.hash(password, rounds)

    const newUser = {
      username: username, 
      email: email, 
      password: hashPassword
    }
    
    const user = await User.create(newUser)  // a Mongoose document 
    const userObject = user.toObject(); 
    delete userObject.password

    req.session.user = await userObject
    return res.json({status: true, user: userObject})  // retrun

  } catch (error) {
    console.error('Error during username or email check:', error)
    next(error)  //  need an error-handling middleware 
  }
}