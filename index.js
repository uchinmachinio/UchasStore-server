require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const authRoute = require("./routes/Auth.js");
const cartRoute = require("./routes/Cart.js");
const personalDataRoute = require("./routes/PersonalData.js.js");
const productsRoute = require("./routes/Products.js");
const uploadsRoute = require("./routes/Uploads.js");
const ordersRoute = require("./routes/Orders.js");
const stripeRoute = require("./routes/Stripe.js");

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
};

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Origin, X-Requested-With, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(cors(corsOptions));
app.use(express.static("public"));
app.use("/stripe/webhook", express.raw({ type: "application/json" }));
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 14 * 24 * 60 * 60,
      autoRemove: "native",
      sameSite: "None",
      secure: true,
    }),
  })
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.set("strictQuery", true);
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("db connected"))
  .catch((err) => console.log(err));

require("./models/Models");
app.use("/auth", authRoute);

app.get("/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.json({});
  }
});

app.get("/imagekit-auth", function (req, res) {
  let result = imagekit.getAuthenticationParameters();
  res.send(result);
});

app.use("/products", productsRoute);

app.use("/uploads", uploadsRoute);

app.use("/personal-data", personalDataRoute);

app.use("/cart", cartRoute);

app.use("/orders", ordersRoute);

app.use("/stripe", stripeRoute);

const PORT = process.env.PORT || 4000;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`Server is running on port ${PORT}`);
  }
});
