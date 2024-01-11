const express = require("express");
const router = express.Router();
const { Product, Cart } = require("../models/Models");

router.get("/", async (req, res) => {
  try {
    const foundCart = await Cart.findOne({ owner: req.user._id }).lean().exec();

    if (!foundCart || (foundCart.items && foundCart.items.length === 0)) {
      return res.json([]);
    }

    const cartIds = foundCart.items.map((item) => item.product._id);
    const products = await Product.find({ _id: { $in: cartIds } })
      .lean()
      .exec();

    const cartItems = foundCart.items
      .filter((item) => {
        const matchingProd = products.find((product) =>
          product._id.equals(item.product._id)
        );
        return matchingProd; // Only include items with matching products
      })
      .map((item) => {
        const matchingProd = products.find((product) =>
          product._id.equals(item.product._id)
        );

        if (matchingProd) {
          return { product: matchingProd, quantity: item.quantity };
        }
      });

    res.json(cartItems);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const ids = req.body.map((item) => item.id);
    const products = await Product.find({ _id: { $in: ids } });

    const quantifiedProducts = req.body.map((item) => {
      const matchingProd = products.find((prod) => prod._id.equals(item.id));

      if (matchingProd) {
        return {
          product: { ...matchingProd.toObject() },
          quantity: item.quantity,
        };
      }
    });

    const updatedCart = await Cart.findOneAndUpdate(
      { owner: req.user._id },
      { items: quantifiedProducts },
      { new: true } // To return the updated document
    );

    if (!updatedCart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
