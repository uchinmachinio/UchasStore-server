const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  images: [String],
  location: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  sellerName: String,
  uploadDate: Date,
});

const orderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  orderDate: Date,
  arrivalDate: Date,
  items: [
    {
      product: productSchema,
      quantity: { type: Number, default: 1 },
    },
  ],
  status: String,
  cost: Number,
  shippingCost: Number,
  destination: Object,
});

const cartSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      product: productSchema,
      quantity: { type: Number, default: 1 },
    },
  ],
});

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  profileImage: {
    type: String,
    default: "defaultimage",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  personalId: {
    type: String,
    default: "",
  },
  birthDate: {
    type: Date,
    default: "",
  },
  name: {
    type: String,
    default: "",
  },
  lastName: {
    type: String,
    default: "",
  },
});

userSchema.plugin(passportLocalMongoose, { selectFields: "username" });

const Product = mongoose.model("Product", productSchema);

const User = mongoose.model("User", userSchema);

const Order = mongoose.model("Order", orderSchema);

const Cart = mongoose.model("Cart", cartSchema);

module.exports = { User, Product, Order, Cart };
