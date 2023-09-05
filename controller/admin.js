const { validationResult } = require("express-validator");
const Product = require("../models/product");
const User = require("../models/users");
const bcrypt = require("bcrypt");

//menambahkan product
exports.addProduct = async (req, res, next) => {
  const errors = validationResult(req);

  const nama = req.body.nama;
  const harga = req.body.harga;
  const imageUrl = req.body.imageUrl;
  const kategori = req.body.kategori;
  const stok = req.body.stok;
  const deskripsi = req.body.deskripsi;
  const review = req.body.review;
  const rating = req.body.rating;
  const createdAt = req.body.createdAt;
  const body = req.body;

  const product = new Product(
    nama,
    +harga,
    imageUrl,
    kategori,
    +stok,
    null,
    deskripsi,
    review,
    rating,
    createdAt
  );
  try {
    if (!errors.isEmpty()) {
      const error = new Error(
        "Product tidak valid, silahkan masukan data yang benar"
      );
      error.statusCode = 422;
      error.errorValidationMsg = errors.array();
      throw error;
    }
    await product.save();
    res.status(201).json({
      message: "product berhasil ditambahkan",
      product: { product },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getProductAdmin = async (req, res, next) => {
  try {
    const product = await Product.getProduct();
    res.status(200).json({
      message: "sukses",
      product: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sendEditProduct = async (req, res, next) => {
  const editNama = req.body.nama;
  const editHarga = req.body.harga;
  const editImageUrl = req.body.imageUrl;
  const editKategori = req.body.kategori;
  const editStok = req.body.stok;
  const prodId = req.params.prodId;
  const editDeskripsi = req.body.deskripsi;
  const editReview = req.body.review;
  const editRating = req.body.rating;

  const product = new Product(
    editNama,
    editHarga,
    editImageUrl,
    editKategori,
    editStok,
    prodId,
    editDeskripsi,
    editReview,
    editRating
  );

  try {
    await product.save();
    res.status(201).json({
      message: "product berhasil di edit",
      product: product,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.sendDeleteProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  try {
    await Product.deleteProductById(prodId);
    res.status(201).json({ message: "DELETE SUKSES" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.registerAccount = async (req, res, next) => {
  const errors = validationResult(req);

  const userId = req.params.userId;
  const nameRegister = req.body.nama;
  const emailRegister = req.body.email;
  const passwordRegister = req.body.password;
  const roleRegister = req.body.role;
  const passwordRepeatRegister = req.body.passwordRepeat;
  const cart = req.body.cart;
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  const hashPassword = await bcrypt.hash(passwordRegister, salt);

  const user = new User(
    userId,
    nameRegister,
    emailRegister,
    hashPassword,
    cart,
    roleRegister
  );

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validasi Gagal");
      error.statusCode = 422;
      error.errorValidationMsg = errors.array();
      throw error;
    }
    await user.save();

    res.status(201).json({
      message: "Berhasil membuat akun",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.loginAccount = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  try {
    const userAccount = await User.findUser(email, password);

    res.status(200).json({
      message: "login sukses",
      detailInfo: userAccount,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.gantiPassword = async (req, res, next) => {
  const errors = validationResult(req);

  const email = req.body.email;
  const newPassword = req.body.newPassword;

  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  const hashPassword = await bcrypt.hash(newPassword, salt);

  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validasi Gagal");
      error.statusCode = 422;
      error.errorValidationMsg = errors.array();
      throw error;
    }

    await User.changePasswordUser(email, hashPassword);
    res.status(201).json({
      message: "Password berhasil diganti",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const allUser = await User.findUserList();
    res.status(200).json({
      message: "berhasil mendapatkan list user",
      userList: allUser,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    await User.deleteUserById(userId);

    res.status(201).json({
      message: "User Berhasil Dihapus",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAllOrder = async (req, res, next) => {
  try {
    const getListOrder = await User.getListAllOrder();
    res.status(200).json({
      message: "Berhasil mendapatkan List order",
      data: getListOrder,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleOrderAdmin = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const singleOrder = await User.getSingleOrder(orderId);
    res.status(200).json({
      message: "berhasil mengambil single order",
      data: singleOrder,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.putStatusOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const statusPengiriman = req.body.statusPengiriman;

  try {
    await User.updatePengiriman(orderId, statusPengiriman);
    res.status(201).json({
      message: "Berhasil Mengirim",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
