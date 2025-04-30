const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const {
  createProduct,
  getProductById,
  getProducts,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  getProductsByCategoryName,
} = require("../controllers/productController");

router.post("/createProduct", authMiddleware, createProduct);
router.get("/getProductById/:id", authMiddleware, getProductById);
router.get(
  "/getAllProductsByCategoryName/:categoryName",
  getProductsByCategoryName
);

router.get("/getProducts", authMiddleware, getProducts);
router.put("/updateProduct/:id", authMiddleware, updateProduct);
router.delete("/deleteProduct/:id", authMiddleware, deleteProduct);

router.get(
  "/getProductsByCategory/:categoryId",
  authMiddleware,
  getProductsByCategory
);

module.exports = router;
