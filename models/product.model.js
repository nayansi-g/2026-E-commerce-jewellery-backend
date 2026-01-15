const mongoose = require("mongoose")

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        index: true
    },
    description: {
        type: String
    },
    metal: {
        type: String, // Gold / Silver
        required: true,
    },
    purity: {
        type: String, // 22K, 18K, 925
        required: true,
    },
    weight: {
        type: Number, // in grams
        required: true,
    },
    images: [String],
    oldprice: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "category"
    },
    stock: {
        type: Number,
        default: 1,
    }
},
    { timestamps: true })

module.exports = mongoose.model("product", productSchema)