require("dotenv").config();
const stripe = require("stripe")(
  "sk_test_51O48yMK3u7NxlC0EfBnB4HvJ4LB0XYFrLog9C5PBKadg7g96w0597yKVK7R9rHlvpwqHA3ShRakWug2c0Rk6G218001wC7pbsE"
);
const express = require("express");
const router = express.Router();
const { Product, Order, Cart } = require("../models/Models");

router.post("/create-checkout-session", async (req, res) => {
  try {
    const ids = req.body.items.map((item) => item.id);
    const products = await Product.find({ _id: { $in: ids } });

    const quantifiedProducts = req.body.items.map((item) => {
      const matchingProd = products.find((prod) => {
        return prod._id.equals(item.id);
      });

      if (matchingProd) {
        return {
          ...matchingProd.toObject(),
          quantity: item.quantity,
        };
      }
    });

    const customer = await stripe.customers.create({
      metadata: {
        userId: req.user.id,
      },
    });
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer: customer.id,
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "usd",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 1500,
              currency: "usd",
            },
            display_name: "Next day air",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 1,
              },
              maximum: {
                unit: "business_day",
                value: 1,
              },
            },
          },
        },
      ],
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GE", "GB"],
      },
      line_items: quantifiedProducts.map((item) => {
        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: item.name,
            },
            unit_amount: item.price * 100,
          },
          quantity: item.quantity,
        };
      }),
      success_url: `${process.env.CLIENT_URL}/orders`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "something went wrong" });
  }
});

// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_TEST_SECRET;

router.post("/webhook", async (request, response) => {
  const sig = request.headers["stripe-signature"];

  try {
    const event = stripe.webhooks.constructEvent(
      request.body,
      sig,
      endpointSecret
    );
    console.log("Webhook verified");

    const data = event.data.object;
    const eventType = event.type;

    if (eventType === "checkout.session.completed") {
      const customer = await stripe.customers.retrieve(data.customer);
      const carts = await Cart.find({ owner: customer.metadata.userId });

      const arrivalDate = data.total_details.amount_shipping ? 7 : 14;
      const newOrder = new Order({
        buyer: customer.metadata.userId,
        orderDate: Date.now(),
        arrivalDate: Date.now() + arrivalDate * 24 * 60 * 60 * 1000,
        items: carts[0].items,
        status: "on the way",
        cost: data.amount_total / 100,
        shippingCost: data.total_details.amount_shipping / 100,
        destination: data.customer_details.address,
      });

      await newOrder.save();
      console.log("Order created");
    }
  } catch (err) {
    console.log(`Webhook Error: ${err.message}`);
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  response.status(200).end();
});

module.exports = router;
