const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const productController = require("../controller/products");
const isAuth = require("../middleware/is-auth").authUser;

//mengambil product path=/product
router.get("/product", productController.getProduct);

//mengambil single product path=/product/:namaProd
router.get("/product/single-product/:prodId", productController.singleProduct);

//mengedit singleProduct path=/product/edit-product/:prodId
router.get("/product/edit-product/:prodId", productController.getEditProduct);

//mendapatkan list kategori path=/product/list-kategori
router.get("/product/list-kategori", productController.getListKetegori);

//mendapatkan list filter product path=/product/filter-product
router.get("/search", productController.getFilterProduct);

//mengirim cart path=/add-cart
router.post("/add-cart", isAuth, productController.postCart);

//mendapatkan cart path=/get-cart
router.get("/get-cart", isAuth, productController.getCart);

//mengurangi quantity pada cart path=/delete-cart
router.put("/reduce-quantity/:id", isAuth, productController.reduceQuantity);

//menghapus cart path=/delete-cart
router.delete("/delete-cart/:id", isAuth, productController.deleteCart);

//mengirim detail order path=/order
router.post(
  "/order-product",
  [
    body("takeUserInfo.namaPenerima")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Nama minimal 4 huruf"),
    body("takeUserInfo.alamatPenerima")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Alamat minimal 5 huruf"),
    body("takeUserInfo.kotaPenerima")
      .trim()
      .isLength({ min: 4 })
      .withMessage("Kota minimal 4 huruf"),
    body("takeUserInfo.kodePos")
      .trim()
      .isLength({ min: 6 })
      .withMessage("kodePos minimal 6 huruf"),
  ],
  isAuth,
  productController.orderProduct
);

//mendapatkan detail order path=/get-order
router.get("/get-order", isAuth, productController.getOrder);

//mendapatkan single detail order path=/get-order
router.get(
  "/get-single-order/:orderId",
  isAuth,
  productController.getSingleOrder
);

//mengirim review path=/kirim-review
router.post(
  "/kirim-review/:prodId",
  isAuth,
  productController.postReviewProduct
);

router.get("/get-user-account", isAuth, productController.getInitUser);

module.exports = router;
