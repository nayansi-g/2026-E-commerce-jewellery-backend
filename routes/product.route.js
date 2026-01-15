const Product = require("../models/product.model")
const express = require("express")
const upload = require("../middlewares/multer")
const authenticatedUser = require("../Authentication/auth")
const router = express.Router();
const fs = require("fs")

//create

router.post("/admin/create", upload.array("images", 5), authenticatedUser, async (req, res) => {

  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "this user is not admin and cann't add products" })
    } else {

      const { name,
        description,
        metal,
        purity,
        weight,
        oldprice,
        price,
        stock, category: categoryId } = req.body;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "Images are required" });
      }

      const images = req.files.map((file) => file.path);

      const newProduct = await Product.create({
        name,
        description,
        metal,
        purity,
        weight,
        oldprice,
        price, stock, images, category: categoryId
      })
      res.status(200).json({ message: "product added successfully", newProduct })
    }
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: "this user is not admin or something went wrong", error: error })

  }
})


// get all product 

router.get("/", async (req, res) => {
  try {
    const getAllProducts = await Product.find().populate("category", "name")
    res.status(200).json({ getAllProducts: getAllProducts })
  } catch (error) {
    res.status(404).json({ message: "something went wrong", error })

  }
})


router.get("/category/:category", async (req, res) => {
  try {
    const getAllProducts = await Product.find({category:category}).populate("category", "name")
    res.status(200).json({ getAllProducts: getAllProducts })
  } catch (error) {
    res.status(404).json({ message: "something went wrong", error })

  }
})


//get single product

router.get("/:id", async (req, res) => {
  try {
    const getSingleProducts = await Product.findOne({ _id: req.params.id }).populate("category", "name")
    res.status(200).json({ getSingleProducts: getSingleProducts })
  } catch (error) {
    res.status(404).json({ message: "something went wrong", error })

  }
})

//update
router.put("/update/:id", upload.array("images", 6), authenticatedUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "this user is not admin and cann't update products" })
    }

    const { name,description,metal,purity,weight,oldprice,price, stock, category: categoryId } = req.body;

 const product = await Product.findOneAndUpdate({ _id: req.params.id }, {
      name,
      description,
      metal,
      purity,
      weight,
      oldprice,
      price, stock, category: categoryId
    }, { new: true })

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

    if (req.files && req.files.length > 0) {
      // delete old images
      product.images.forEach((img) => {
        if (fs.existsSync(img)) {
          fs.unlinkSync(img);
        }
      });
      product.images = req.files.map((file) => file.path);
    }

    
    res.status(200).json({ message: "product updated successfully", product: product })
  } catch (error) {
    console.log(error)
    res.status(404).json({ message: "this user is not admin or something went wrong", error })

  }
})


//delete

router.delete("/delete/:id", authenticatedUser, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(401).json({ message: "this user is not admin and cann't delete products" 

         });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // delete images from server
    product.images.forEach((img) => {
      if (fs.existsSync(img)) {
        fs.unlinkSync(img);
      }
    });
        await product.deleteOne();
      res.status(200).json({ message: "Product deleted successfully" })
  } catch (error) {
    res.status(404).json({ message: "something went wrong", error })

  }
})

//search & filter api 

router.get("/product-search", async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      inStock,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    let filter = {};

    // 🔍 keyword search
    if (keyword) {
      filter.$or = [
        { name: { $regex: keyword, $options: "i" } },
        { metal: { $regex: keyword, $options: "i" } },
        { purity: { $regex: keyword, $options: "i" } },
      ];
    }

    // 📂 category filter
    if (category && mongoose.Types.ObjectId.isValid(category)) {
      filter.category = category;
    }

    // 💰 price filter
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // 📦 stock filter
    if (inStock === "true") {
      filter.stock = { $gt: 0 };
    }

    // 🔃 sorting
    let sortOption = {};
    if (sort === "priceLow") sortOption.price = 1;
    if (sort === "priceHigh") sortOption.price = -1;
    if (sort === "newest") sortOption.createdAt = -1;

    const products = await Product.find(filter)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("category", "name");

    const total = await Product.countDocuments(filter);

    res.status(200).json({
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Search failed",
      error: error.message,
    });
  }
});





module.exports = router;