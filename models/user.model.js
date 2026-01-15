const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    userName:{
        type:String,
        require:true
    },
    email:{
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true,
        unique:true
    },
    role:{
        type:String,
        enum:["admin" , "user"],
        default:"user"
    }
}
,{timestamps:true})

module.exports = mongoose.model("user", userSchema)