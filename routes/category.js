const express = require("express");
const router = express.Router();
const {
  createCategory,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getCategories,
} = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/createCategory", authMiddleware, createCategory);
router.get("/getAllCategories", authMiddleware, getCategories);
router.get("/getCategoryById/:id", authMiddleware, getCategoryById);
router.put("/updateCategory/:id", authMiddleware, updateCategory);
router.delete("/deleteCategory/:id", authMiddleware, deleteCategory);

module.exports = router;
