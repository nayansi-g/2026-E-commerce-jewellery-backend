const mongoose = require("mongoose")

const Connection = async()=>{
    try {
        const connect = await mongoose.connect("mongodb+srv://nayansigupta29_db_user:VQkqtVm3qKGUINNR@cluster0.quvdwpv.mongodb.net/")
        if(connect){
            console.log("database connected")
        }else{
            console.log("database is not connected")
        }
    } catch (error) {
        console.log(error)
    }
}

module.exports = Connection;