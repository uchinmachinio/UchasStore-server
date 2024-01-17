const express = require("express");
const router = express.Router();
const passport = require("passport");
const { User, Cart } = require("../models/Models");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
    },
    async function (accessToken, refreshToken, profile, cb) {
      try {
        // Check if a user with the Google ID already exists in db
        const existingUser = await User.findOne({
          $or: [
            ({ googleId: profile.id },
            { email: profile.emails[0].value },
            { username: profile.displayName }),
          ],
        });

        if (existingUser) {
          // User already exists, return the user
          return cb(null, existingUser);
        } else {
          const newUser = new User({
            googleId: profile.id,
            username: profile.displayName, // Use the display name from Google as the username
            profileImage: profile.photos[0].value, // Use the first photo URL from Google as the profile image
            email: profile.emails[0].value,
          });

          await newUser.save();
          const newCart = new Cart({
            owner: newUser._id,
            items: [],
          });

          await newCart.save();
          cb(null, newUser);
        }
      } catch (error) {
        cb(error, null);
      }
    }
  )
);

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json("Internal server error");
    }

    if (info) {
      // Authentication failed
      if (info.name === "IncorrectPasswordError") {
        return res.status(401).json("Incorrect password");
      }

      if (info.name === "IncorrectUsernameError") {
        return res.status(400).json("Incorrect username");
      }

      return res.status(401).json("Authentication failed");
    }

    // Authentication succeeded
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json("Internal server error");
      }
      return res.json({ _id: user._id, username: user.username });
    });
  })(req, res, next);
});

router.post("/register", (req, res) => {
  const { username, email, password } = req.body;
  User.findOne({ email: email })
    .then((existingUser) => {
      if (existingUser) {
        return res.status(400).json({ error: "Email is already registered." });
      }
      User.register(
        { username: username, email: email },
        password,
        function (err, user) {
          if (err) {
            if (err.name === "UserExistsError") {
              return res.status(400).json({ error: "Username already in use" });
            } else {
              return res.status(500).json({ error: err.message });
            }
          } else {
            // Create an empty cart for the user
            const newCart = new Cart({
              owner: user._id,
              items: [], // Initialize with an empty array of items
            });

            newCart
              .save()
              .then(() => {
                // Authenticate the user
                passport.authenticate("local")(req, res, function () {
                  return res.json({ _id: user._id, username: user.username });
                });
              })
              .catch((cartError) => {
                console.log(cartError);
                return res.status(500).json({
                  error: "An error occurred while creating the cart.",
                });
              });
          }
        }
      );
    })
    .catch((err) => {
      console.log(err);
      return res.status(500).json({ error: "An error occurred." });
    });
});

router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    prompt: "select_account",
  })
);

// Callback route after successful Google OAuth authentication
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: `${process.env.CLIENT_URL}/`,
    failureRedirect: `${process.env.CLIENT_URL}/`,
  })
);

router.get("/logout", function (req, res) {
  req.session.destroy();
  req.logout(function (err) {
    if (err) console.log(err);
    res.redirect("/");
  });
});

module.exports = router;
