const express = require("express");
const router = express.Router();
const { User } = require("../models/Models");

router.get("/", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user._id }).lean().exec();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = {
      name: user.name,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
      personalId: user.personalId,
      birthDate: user.birthDate,
      email: user.email,
    };

    res.json(userData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $set: {
          name: req.body.name,
          lastName: req.body.lastName,
          phoneNumber: req.body.phoneNumber,
          personalId: req.body.personalId,
          birthDate: req.body.birthDate,
          email: req.body.email,
        },
      },
      { new: true } // To return the updated document
    )
      .lean()
      .exec();

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json("Updated!");
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
