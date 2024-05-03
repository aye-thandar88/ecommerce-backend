const express = require("express");
const router = express.Router();
const multer = require("multer");
const { Product } = require("../models/product");
const { Category } = require("../models/category");
const { default: mongoose } = require("mongoose");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadErr = new Error("invalid image type");

    if (isValid) {
      uploadErr = null;
    }
    cb(uploadErr, "./public/assets");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.replace(/[\s,.]/, "-");
    const extension = FILE_TYPE_MAP[file.mimetype];

    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

//Get All products list
router.get(`/`, async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  const productList = await Product.find()
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

//Get product with specific categories list
router.get(`/`, async (req, res) => {
  const pageSize = parseInt(req.query.pageSize) || 5;
  const pageNo = parseInt(req.query.pageNo) || 1;

  let filter = {};

  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }

  const productList = await Product.find(filter)
    .populate("category")
    .limit(pageSize)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!productList) {
    res.status(500).json({ success: false });
  }
  res.send(productList);
});

//Get product with specific id
router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(500).json({ success: false });
  }
  res.status(200).send(product);
});

//Get count of products
router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments({});

  if (!productCount) {
    res.status(500).json({ success: false });
  }
  res.status(200).json({ success: true, count: productCount });
});

//Get all product with featured
router.get(`/get/featured`, async (req, res) => {
  const pageSize = parseInt(req.body.pageSize) || 5;
  const pageNo = parseInt(req.body.pageNo) || 1;

  const products = await Product.find({ isFeatured: true })
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

//Get products with specific count
router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const pageSize = parseInt(req.body.pageSize) || 5;
  const pageNo = parseInt(req.body.pageNo) || 1;

  const products = await Product.find({ isFeatured: true })
    .limit(+count)
    .skip((pageNo - 1) * pageSize)
    .sort("_id");

  if (!products) {
    res.status(500).json({ success: false });
  }
  res.send(products);
});

router.post(`/`, upload.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);

  const file = req.file;
  if (!file) return res.status(400).send("No image in the equest");

  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/assets/`;

  if (!category) {
    return res.status(400).send("Invalid category");
  }

  try {
    let newProduct = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      isFeatured: req.body.isFeatured,
      dateCreated: req.body.dateCreated,
    });
    newProduct = await newProduct.save();

    if (!newProduct) {
      return res.status(400).send("The product cannot be created.");
    }
    res.status(201).send(newProduct);
  } catch (err) {
    return res.status(500).send({ success: false, error: err });
  }
});

router.patch(`/:id`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).send("Invalid product");
  }

  const category = await Category.findById(req.body.category);
  if (!category) {
    return res.status(400).send("Invalid category");
  }

  const product = await Product.findByIdAndUpdate(req.params.id, {
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    isFeatured: req.body.isFeatured,
    dateCreated: req.body.dateCreated,
  });

  if (!product) {
    return res.status(400).send("The product cannot be updated.");
  }
  res.send(product);
});

router.delete(`/:id`, (req, res) => {
  try {
    Product.findByIdAndDelete(req.params.id).then((product) => {
      if (!product) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found!" });
      }
      return res
        .status(200)
        .json({ success: true, message: "The product is completely deleted." });
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.patch(
  `/gallery-images/:id`,
  upload.array("images", 5),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).send("Invalid product");
    }

    const files = req.files;
    const basePath = `${req.protocol}://${req.get("host")}/public/assets/`;
    let imagePaths = [];

    if (!files || files.length === 0)
      return res.status(400).send("No images were uploaded.");

    files.map((file) => {
      imagePaths.push(`${basePath}${file.filename}`);
    });

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagePaths,
      },
      { new: true }
    );

    if (!product) {
      return res.status(400).send("The product cannot be updated images.");
    }
    res.send(product);
  }
);

module.exports = router;
