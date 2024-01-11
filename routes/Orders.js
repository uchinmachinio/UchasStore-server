const express = require("express");
const router = express.Router();
const { Order } = require("../models/Models");

router.get("/", (req, res) => {
  Order.find({ buyer: req.user._id })
    .then((orders) => {
      res.json(orders);
    })
    .catch((err) => res.status(500).json({ error: "interal server error" }));
});

module.exports = router;
