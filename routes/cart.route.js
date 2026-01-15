const Product = require("../models/product.model")
const Cart = require("../models/cart.model")
const express= require("express")
const authenticatedUser = require("../Authentication/auth")
const router = express.Router();

//get user cart
router.get("/",authenticatedUser,async(req,res)=>{
    let cart = await Cart.findOne({user:req.user.id}).populate("items.product", "name images price")
    if(!cart){
      cart = await Cart.create({user: req.user.id, items: []})
    }
    res.json(cart)
})


//add items to cart

router.post("/add", authenticatedUser,async(req,res)=>{
const {productId, quantity} = req.body;

const product = await Product.findById(productId);
if(!product){
     return res.status(404).json({ message: "Product not found" });
}
    let cart = await Cart.findOne({user:req.user.id})
    if(!cart){
        cart = await Cart.create({user:req.user.id,items:[]})
    }

    const itemIndex = cart.items.findIndex((item)=>item.product.toString() === productId)

    if(itemIndex > -1){
        cart.items[itemIndex].quantity +=quantity
    }else{
        cart.items.push({
            product:productId,
            quantity,
            price:product.price
        })
    }
    cart.totalPrice= cart.items.reduce((sum, item)=>sum+item.price*item.quantity,0)

     await cart.save();
  res.json(cart);

})

//UPDATE CART ITEM QUANTITY 

router.put("/update",authenticatedUser, async(req,res)=>{
     const { productId, quantity } = req.body;
     const cart = await Cart.findOne({ user: req.user.id });
  if (!cart) return res.status(404).json({ message: "Cart not found" });

  const item = cart.items.find((item)=>item.product.toString()===productId)
  if(!item){
    return res.status(404).json({ message: "Item not in cart" });
  }
    item.quantity = quantity;

     cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

    await cart.save();
  res.json(cart);
})

/* REMOVE ITEM FROM CART */

router.delete("/remove/:productId",authenticatedUser, async (req,res)=>{
     const cart = await Cart.findOne({ user: req.user.id });

     cart.items = cart.items.filter((item)=>item.product.toString() !==req.params.productId)
      cart.totalPrice = cart.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

    await cart.save();
  res.json(cart);

})

//delete cart 

router.delete("/clear", authenticatedUser, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();
  res.json({ message: "Cart cleared" });
});

module.exports = router