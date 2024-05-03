const express = require("express");
const router = express.Router();
const { Order } = require("../models/order");
const { OrderItem } = require("../models/orderItem");

//Get all orders list
router.get(`/`, async (req, res, next) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const orderList = await Order.find()
    .populate("user", "name")
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort({ dateOrdered: -1, _id: -1 });

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//Get order by id
router.get(`/:id`, async (req, res, next) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const orderList = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize);

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

//Register new order and orderItem
router.post(`/`, async (req, res) => {
  const orderItems = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        product: orderItem.product,
        qunatity: orderItem.qunatity,
      });

      newOrderItem = await newOrderItem.save();

      return newOrderItem._id;
    })
  );

  const orderItemsIds = await orderItems;

  const totalPrices = Promise.all(
    orderItemsIds.map(async (orederItemId) => {
      const orderItem = await OrderItem.findById(orederItemId).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.qunatity;

      return totalPrice;
    })
  );

  const totalPrice = (await totalPrices).reduce((a, b) => a + b, 0);

  let newOrder = new Order({
    orderItems: orderItemsIds,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    country: req.body.country,
    zip: req.body.zip,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  newOrder = await newOrder.save();

  if (!newOrder) {
    return res.status(400).send("The order cannot be created.");
  }
  res.status(201).send(newOrder);
});

//Update order status
router.patch(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, {
    status: req.body.status,
  });

  if (!order) {
    return res.status(400).send("The order cannot be updated.");
  }
  res.send(order);
});

//Delete order
router.delete(`/:id`, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);

    let removeItem = await order.orderItems.map((orderItem) => orderItem._id);

    await OrderItem.findByIdAndDelete(removeItem);
    return res
      .status(200)
      .json({ success: true, message: "The order is completely deleted." });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

//Get totalSale amount
router.get(`/get/totalSales`, async (req, res) => {
  const totalSales = await Order.aggregate([
    { $group: { _id: null, totalSales: { $sum: `$totalPrice` } } },
  ]);

  if (!totalSales) {
    return res.status(400).send("The order sales cannot be generated");
  }

  res.send({ totalSales: totalSales[0].totalSales });
});

//Get order count
router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments({});

  if (!orderCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({ success: true, count: orderCount });
});

//Get order by userid
router.get(`/get/userOrder/:userId`, async (req, res, next) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const orderList = await Order.find({ user: req.params.userId })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort({ dateOrdered: -1, _id: -1 });

  if (!orderList) {
    return res.status(500).json({ success: false });
  }
  res.send(orderList);
});

module.exports = router;
