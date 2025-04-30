const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategories,
  getAllProductsByCategory,
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/getAllProductsByCategory/:id", getAllProductsByCategory);
router.get("/getAllCategories", getCategories);
router.get("/getCategoryById/:id", authMiddleware, getCategoryById);

router.post("/createCategory", authMiddleware, createCategory);

router.put("/updateCategory/:id", authMiddleware, updateCategory);

router.delete("/deleteCategory/:id", authMiddleware, deleteCategory);

module.exports = router;
