const Category = require("../models/Category");
const Product = require("../models/Product");

const createCategory = async (req, res) => {
  try {
    const { name, type, description, image } = req.body;
    console.log("req.body", req.body);
    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Category name and type are required" });
    }

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = new Category({
      name,
      type,
      description,
      image,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    });
    await category.save();
    res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res
      .status(200)
      .json({ message: "Category fetched successfully", category });
  } catch (error) {
    console.error("Get Category Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res
      .status(200)
      .json({ message: "Categories fetched successfully", categories });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllProductsByCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Product.find({ category: category._id });
    const categoryData = {
      _id: category._id,
      name: category.name,
    };
    res.status(200).json({
      message: "Products fetched successfully",
      products: products,
      category: categoryData,
    });
  } catch (error) {
    console.error("Get Products By Category Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { name, type, description, image } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ message: "Category name and type are required" });
    }

    const existingCategory = await Category.findOne({
      name,
      _id: { $ne: req.params.id },
    });
    if (existingCategory) {
      return res
        .status(400)
        .json({ message: "Category with this name already exists" });
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      {
        name,
        type,
        description,
        image,
        updatedBy: req.user._id,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res
      .status(200)
      .json({ message: "Category updated successfully", category });
  } catch (error) {
    console.error("Update Category Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete Category Error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid category ID" });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createCategory,
  getCategoryById,
  getCategories,
  updateCategory,
  deleteCategory,
  getAllProductsByCategory,
};
