require("dotenv").config();
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { User, Product } = require("../models/Models");
const sharp = require("sharp");
const ImageKit = require("imagekit");

const imagekit = new ImageKit({
  urlEndpoint: process.env.IMAGEKIT_URL,
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.get("/", async (req, res) => {
  try {
    const limit = 16;
    const page = parseInt(req.query.page) || 1;
    const cat = req.query.category;
    const searchText = req.query.searchtext;
    const firstIndex = (page - 1) * limit;

    const filter = {};

    if (cat && cat !== "All") {
      filter.category = cat;
    }

    if (searchText) {
      filter.name = { $regex: searchText, $options: "i" };
    }

    const count = await Product.countDocuments(filter);
    const numberOfPages = count ? Math.ceil(count / limit) : 1;
    const productCount = count;

    const products = await Product.find(filter)
      .limit(limit)
      .skip(firstIndex)
      .exec();

    res.json({ numberOfPages, products, productCount });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id).lean().exec();
    res.json(prod);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", upload.array("images[]"), async (req, res) => {
  try {
    const { name, description, price, country, category } = req.body;

    const uploadPromises = req.files.map(async (file) => {
      const data = await sharp(file.path)
        .rotate()
        .resize({ width: 1000, height: 1000 })
        .toBuffer();

      const formatedName = file.filename.replace(/[^\w.\-]/g, ""); //formatting file name based on imagekit rules.

      return new Promise((resolve, reject) => {
        imagekit.upload(
          {
            file: data,
            fileName: formatedName,
            useUniqueFileName: false,
          },
          function (error, result) {
            if (error) {
              console.log(error);
              reject(error);
            } else {
              console.log(result);
              resolve(formatedName);
            }
          }
        );
      });
    });

    const images = await Promise.all(uploadPromises);

    const newProduct = new Product({
      name,
      description,
      price,
      images,
      location: country,
      category,
      seller: req.user._id,
      sellerName: req.user.username,
      uploadDate: Date.now(),
    });

    await newProduct.save();

    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $push: { uploads: newProduct } }
    );

    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Product.findOneAndDelete({ _id: req.params.id });
    res.status(200).end();
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "internal server error" });
  }
});

module.exports = router;
