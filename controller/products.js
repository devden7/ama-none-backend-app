const { validationResult } = require("express-validator");

const Product = require("../models/product");
const User = require("../models/users");

exports.getProduct = async (req, res, next) => {
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

exports.getListKetegori = async (req, res, next) => {
  try {
    const kategori = await Product.getKategori();
    res.status(200).json({
      message: "fetch kategori sukses",
      kategori: kategori,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.singleProduct = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const singleProduct = await Product.findByNama(prodId);

    res.status(200).json({
      message: "single product berhasil",
      singleProduct: singleProduct,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getEditProduct = async (req, res, next) => {
  const prodId = req.params.prodId;

  try {
    const getProductEdit = await Product.findById(prodId);
    res.status(200).json({
      message: "get product edit sukses",
      getProductEdit: getProductEdit,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getFilterProduct = async (req, res, next) => {
  const kategoriReq = req.query.kategori;
  const hargaReq = req.query.harga;
  const ratingReq = req.query.rating;
  const listReq = req.query.list;
  const pageReq = req.query.page;
  const keywordReq = req.query.keyword;
  try {
    const filterProduct = await Product.filterProduct(
      kategoriReq,
      hargaReq,
      ratingReq,
      listReq,
      pageReq,
      keywordReq
    );

    res.status(200).json({
      message: "Filter product berhasil diambil",
      filterProduct: filterProduct.data,
      totalDocumentProduct: filterProduct.totalDocument,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postCart = async (req, res, next) => {
  const product = req.body;
  try {
    await User.addToCart(product);
    res.status(201).json({ message: "ditambahkan ke cart" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const cart = await User.getFromCart();
    res.status(200).json({ message: "cart berhasil diambil", items: cart });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.reduceQuantity = async (req, res, next) => {
  const itemId = req.params.id;
  try {
    await User.reduceQuantityCart(itemId);
    res.status(201).json({ message: "Quantity Ditambahkan" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteCart = async (req, res, next) => {
  const itemId = req.params.id;
  try {
    await User.deleteItemCart(itemId);
    res.status(201).json({ message: "DELETE CART SUKSES" });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.orderProduct = (req, res, next) => {
  const tanggal = req.body.tanggal;
  const userInfoPenerima = req.body.takeUserInfo;
  const pembayaran = req.body.takeTypePembayaran;
  const totalBelanja = req.body.totalBelanja;
  const statusOrder = req.body.status;

  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error("Validasi gagal");
      error.statusCode = 422;
      error.errorValidationMsg = errors.array();
      throw error;
    }
    User.postOrder(
      userInfoPenerima,
      tanggal,
      totalBelanja,
      pembayaran,
      statusOrder
    );
    res.status(201).json({
      message: "order berhasil",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrder = async (req, res, next) => {
  try {
    const dataOrder = await User.getOrderData();
    res.status(200).json({
      message: "Data berhasil di ambil",
      dataOrder,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getSingleOrder = async (req, res, next) => {
  const orderId = req.params.orderId;
  const statusPengiriman = req.body.statusPengiriman;

  try {
    const orderDetail = await User.findOrderById(orderId, statusPengiriman);
    res.status(200).json({
      message: "berhasil mengambil detail order",
      orderDetail: orderDetail,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.postReviewProduct = async (req, res, next) => {
  const prodId = req.params.prodId;
  const userId = req.body.userId;
  const userName = req.body.userName;
  const ratingUser = req.body.rating;
  const reviewUser = req.body.review;
  const tanggal = req.body.tanggal;

  try {
    await Product.reviewProduct(
      prodId,
      userId,
      userName,
      ratingUser,
      reviewUser,
      tanggal
    );
    res.status(201).json({
      message: "Review Product Terkirim",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getReviewProduct = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const listReview = await User.getReviewUser(orderId);
    res.status(200).json({
      message: "Review diambil",
      data: listReview,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
