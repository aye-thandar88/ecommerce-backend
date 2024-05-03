const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");

router.get(`/`, async (req, res, next) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const categoryList = await Category.find()
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!categoryList) {
    return res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.get(`/:id`, async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const categoryList = await Category.findById(req.params.id)
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!categoryList) {
    return res.status(500).json({
      success: false,
      message: "The category with given ID was not found.",
    });
  }
  res.status(200).send(categoryList);
});

//Get count of category
router.get(`/get/count`, async (req, res) => {
  const categoryCount = await Category.countDocuments({});

  if (!categoryCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({ success: true, count: categoryCount });
});

router.post(`/`, async (req, res) => {
  let newCategory = new Category({
    name: req.body.name,
    color: req.body.color,
    icon: req.body.icon,
    image: req.body.image,
  });

  newCategory = await newCategory.save();

  if (!newCategory) {
    return res.status(400).send("The category cannot be created.");
  }
  res.status(201).send(newCategory);
});

router.delete(`/:id`, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      return res
        .status(404)
        .json({ success: false, message: "Category not found!" });
    }
    return res
      .status(200)
      .json({ success: true, message: "The category is completely deleted." });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

router.patch(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
    image: req.body.image,
  });

  if (!category) {
    return res.status(400).send("The category cannot be updated.");
  }
  res.send(category);
});

module.exports = router;
