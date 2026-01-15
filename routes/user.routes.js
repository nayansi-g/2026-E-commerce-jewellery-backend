const User = require("../models/user.model")
const express = require("express") 
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")


//signup
router.post("/signup" , async(req,res)=>{
    try {
        const {userName, email, password} = req.body;
        const hashPassword = await bcrypt.hash(password,10)

           if (!userName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

        const existsUser = await User.findOne({email})
        if(existsUser){
            return res.status(401).json({message:"user is already exists"})
        }
        const user = await User.create({userName, email, password:hashPassword})
        res.status(200).json({
            userName:user.userName,
            email:user.email,
            token: jwt.sign({_id:user._id, userName:user.userName, role:user.role},"jwt_secret")
        })

    } catch (error) {
        res.status(500).json({message:"error in signing up" , error})
    }
})


//login

router.post("/login" , async(req,res)=>{
    try {
        const {email, password}= req.body;
            if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

        const user = await User.findOne({email})
        if(!user){
            return res.status(401).json({message:"user is not found or signup first"})
        }
        const validUser = await bcrypt.compare(password, user.password)
         if(!validUser){
            return res.status(401).json({message:"unauthorized user or signup first"})
        }
         res.status(200).json({
           message:"login successful",
            token: jwt.sign({_id:user._id, userName:user.userName, role:user.role},"jwt_secret")
        })
        

    } catch (error) {
        console.log(error)
         res.status(500).json({message:"error in login" , error})
    }
})

module.exports = router;