const Product = require("../models/Product");

const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      discount,
      size,
      rating,
      reviews,
      tags,
      brand,
    } = req.body;
    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock,
      discount,
      size,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      rating,
      reviews,
      tags,
      brand,
    });
    console.log("product before saving", product);
    await product.save();
    console.log("product after saving", product);
    res.status(201).json({
      message: "Product created successfully",
      success: true,
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product fetched successfully", product });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getProductsByCategoryName = async (req, res) => {
  try {
    const { categoryName } = req.params;

    // First find the category by name
    const category = await Category.findOne({ name: categoryName });

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Then find all products with that category id
    const products = await Product.find({ category: category._id });

    res.status(200).json({
      message: "Products fetched successfully",
      category,
      products,
    });
  } catch (error) {
    console.error("Get products by category name error:", error);
    res.status(400).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = req.body;

    // Make sure updatedBy is set to current user
    productData.updatedBy = req.user._id;
    productData.updatedAt = Date.now();

    const product = await Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(400).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(400).json({ message: error.message });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.categoryId });
    res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByCategoryName,
};
