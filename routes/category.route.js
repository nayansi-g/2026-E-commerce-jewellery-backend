const Product = require("../models/product.model")
const Category = require("../models/category.model")
const express= require("express")
const authenticatedUser = require("../Authentication/auth")
const router = express.Router();

//create

router.post("/create" , authenticatedUser, async(req,res)=>{
    
   try {
        if(!req.user.isAdmin){
            return res.status(401).json({message:"this user is not admin and cann't add category"})
        }else{
            const {name } = req.body;
             const exists = await Category.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }
            const newCategory = await Category.create({name,
      createdBy: req.user.id})
            res.status(200).json({message:"Category added successfully",newCategory:newCategory})
        }
   } catch (error) {
        console.log(error);
       res.status(404).json({message:"this user is not admin or something went wrong", error})

   }
})


// get all product 

router.get("/", async(req,res)=>{
   try {
            const getAllCategory = await Category.find()
            res.status(200).json({getAllCategory:getAllCategory})
        }catch (error) {
       res.status(404).json({message:"something went wrong", error})

   }
})


//get single product

router.get("/:id", async(req,res)=>{
   try {
            const getSingleCategory = await Category.findOne({_id:req.params.id})
            res.status(200).json({getSingleCategory:getSingleCategory})
        }catch (error) {
       res.status(404).json({message:"something went wrong", error})

   }
})

//update
// router.put("/update/:id" , authenticatedUser, async(req,res)=>{
//    try {
//         if(!req.user.isAdmin){
//             return res.status(401).json({message:"this user is not admin and cann't update Category"})
//         }else{
//             const {name } = req.body;
//             const updatedCategory = await Category.findOneAndUpdate({ _id: req.params.id },{name},{new:true})
//             res.status(200).json({message:"Category updated successfully",updatedCategory:updatedCategory})
//         }
//    } catch (error) {
//        res.status(404).json({message:"this user is not admin or something went wrong", error})

//    }
// })


//delete

router.delete("/delete/:id",authenticatedUser, async(req,res)=>{
   try {
     if(!req.user.isAdmin){
            return res.status(401).json({message:"this user is not admin and cann't delete Category"})
        }else{
           const deleteCategory = await Category.findOneAndDelete({_id:req.params.id})
            res.status(200).json({message:"Category deleted successfully"})
        }}catch (error) {
       res.status(404).json({message:"something went wrong", error})

   }
})

module.exports = router

