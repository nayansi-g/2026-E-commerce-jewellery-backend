
require("dotenv").config();
const express = require("express")
const cors = require("cors")
const app = express()
app.use(cors("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }));


const port = process.env.PORT || 5000
const authenticatedUser = require("./Authentication/auth")
const userRouter = require("./routes/user.routes");
const productRouter = require("./routes/product.route")
const categoryRouter = require("./routes/category.route")
const cartRouter = require("./routes/cart.route")
const orderRouter = require("./routes/order.route")
const paymentRouter = require("./routes/payment.route")

app.use("/uploads", express.static("uploads"));


const connection = require("./connection/connection")
connection()

app.use("/user", userRouter)
app.use("/product", productRouter)
app.use("/category", categoryRouter)
app.use("/cart", cartRouter)
app.use("/order", orderRouter)
app.use("/payment", paymentRouter)
app.get("/" , (req,res)=>{
    res.send("this is my first app")
});

app.listen(port,(err)=>{
    if(!err){
        console.log(`app is started ${port}`)
    }else{
        console.log("app is not running",err)
    }
})