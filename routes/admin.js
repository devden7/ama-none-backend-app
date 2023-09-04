const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const takeDb = require("../util/database").takeDb;
const adminController = require("../controller/admin");
const isAuth = require("../middleware/is-auth");

//mengambil product path=/product
router.get("/products", isAuth, adminController.getProductAdmin);

//menambahkan product path=/admin/add-product
router.post(
  "/add-product",
  isAuth,
  [
    body("nama").trim().isLength({ min: 5 }),
    body("harga").trim().isLength({ min: 4 }),
    body("imageUrl").trim().isLength({ min: 1 }),
    body("kategori").trim().isLength({ min: 1 }),
    body("stok").trim().isLength({ min: 1 }),
    body("deskripsi").trim().isLength({ min: 10 }),
  ],
  adminController.addProduct
);

//mengirim hasil EDIT singleProduct path=/admin/edit-product/:prodId
router.put("/edit-product/:prodId", isAuth, adminController.sendEditProduct);

//mengirim hasil DETELE singleProduct path=/admin/delete-product/:prodId
router.delete(
  "/delete-product/:prodId",
  isAuth,
  adminController.sendDeleteProduct
);

//mengirim hasil register path=/register
router.post(
  "/register",
  [
    body("nama").trim().isLength({ min: 3 }).withMessage("Minimal 3 Huruf"),
    body("email")
      .isEmail()
      .custom(async (value, { req }) => {
        const db = takeDb();
        try {
          const cekEmail = await db
            .collection("users")
            .findOne({ email: value });
          if (cekEmail) {
            return Promise.reject("Email sudah digunakan");
          }
        } catch (err) {
          console.log(err);
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 6 }).withMessage("Minimal 6 huruf"),
    body("passwordRepeat")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          return Promise.reject("Password tidak sama!");
        }
        return true;
      }),
  ],
  adminController.registerAccount
);

//mengirim hasil EDIT ganti password path=/admin/ganti-password
router.put(
  "/ganti-password",
  [
    body("newPassword")
      .trim()
      .isLength({ min: 6 })
      .withMessage("Minimal 6 huruf"),
    body("newPasswordRepeat")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          return Promise.reject("Password tidak sama!");
        }
        return true;
      }),
  ],
  isAuth,
  adminController.gantiPassword
);

//login  path=/login
router.post("/login", adminController.loginAccount);

//mendapatkan listUser path=/get-user-name
router.get("/get-all-user", isAuth, adminController.getUser);

//mendelete listUser path=/get-user-name
router.delete("/delete-user/:userId", isAuth, adminController.deleteUser);

//mendapatkan allOrder path=/get-all-order
router.get("/get-all-order", isAuth, adminController.getAllOrder);

//mendapatkan singleOrder path=/get-all-order
router.get(
  "/single-order-admin/:orderId",
  isAuth,
  adminController.getSingleOrderAdmin
);

//mengirim hasil EDIT singleProduct path=/admin/edit-product/:prodId
router.put("/kirim-barang/:orderId", isAuth, adminController.putStatusOrder);

module.exports = router;
