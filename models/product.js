const mongodb = require("mongodb");
const takeDb = require("../util/database").takeDb;
class Product {
  constructor(
    nama,
    harga,
    imageUrl,
    kategori,
    stok,
    prodId,
    deskripsi,
    review,
    rating,
    createdAt
  ) {
    this.nama = nama;
    this.harga = harga;
    this.imageUrl = imageUrl;
    this.kategori = kategori;
    this.stok = stok;
    this._id = prodId ? new mongodb.ObjectId(prodId) : null;
    this.deskripsi = deskripsi;
    this.review = review;
    this.rating = rating;
    this.createdAt = createdAt;
  }

  async save() {
    const db = takeDb();
    let statDb;
    try {
      //update DB product
      if (this._id) {
        statDb = await db
          .collection("products")
          .updateOne({ _id: this._id }, { $set: this });
      } else {
        statDb = await db.collection("products").insertOne(this);
      }
      return statDb;
    } catch (err) {
      console.log(err);
    }
  }

  static async getProduct() {
    const db = takeDb();
    try {
      const data = await db.collection("products").find().toArray();

      return data;
    } catch (err) {
      console.log(err);
    }
  }

  static async getKategori() {
    const db = takeDb();
    try {
      const data = await db
        .collection("products")
        .aggregate([
          {
            $group: {
              _id: "$kategori",
              harga: { $first: "$harga" },
              rating: { $last: "$rating" },
            },
          },
        ])
        .sort({ _id: 1 })
        .toArray();

      return data;
    } catch (err) {
      console.log(err);
    }
  }

  static async findByNama(prodId) {
    const db = takeDb();
    const cariNama = prodId.replace("-", " ");
    try {
      const data = await db
        .collection("products")
        .find({ _id: new mongodb.ObjectId(prodId) })
        .next();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  static async findById(prodId) {
    const db = takeDb();
    try {
      const data = await db
        .collection("products")
        .find({
          _id: new mongodb.ObjectId(prodId),
        })
        .next();
      return data;
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteProductById(prodId) {
    const db = takeDb();

    try {
      await db
        .collection("products")
        .deleteOne({ _id: new mongodb.ObjectId(prodId) });
    } catch (err) {
      console.log(err);
    }
  }

  static async filterProduct(
    kategoriProduct,
    hargaProduct,
    ratingProduct,
    listProduct,
    numberPageProduct,
    keywordProduct
  ) {
    const db = takeDb();

    const splitHarga = hargaProduct.split("-");
    const hargaAwal = splitHarga.slice(0, 1).join();
    const hargaAkhir =
      splitHarga.slice(-1).join() === "keatas"
        ? 100000000
        : splitHarga.slice(-1).join();
    const sortTerbaru = { createdAt: -1 };
    const sortHargaMenurun = { harga: -1 };
    const sortHargaMenaik = { harga: 1 };
    const sortRatingTerbaik = { rating: -1 };

    let sortField;
    let filterProduct;
    let perPage = 5;
    const skipDocument = (numberPageProduct - 1) * perPage;
    if (listProduct === "terbaru") {
      sortField = sortTerbaru;
    } else if (listProduct === "termahal") {
      sortField = sortHargaMenurun;
    } else if (listProduct === "termurah") {
      sortField = sortHargaMenaik;
    } else {
      sortField = sortRatingTerbaik;
    }

    try {
      /*jika kategori : "semua", harga : "bukan semua", rating: "bukan semua" keyword: "semua"*/ if (
        kategoriProduct === "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct !== "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = { $gt: +hargaAwal, $lte: +hargaAkhir };
      } /*jika kategori : "semua", harga : "semua", rating: "bukan semua" keyword: "semua"*/ else if (
        kategoriProduct === "semua" &&
        hargaProduct === "semua" &&
        ratingProduct !== "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = {
          rating: { $gte: +ratingProduct, $lte: +ratingProduct + 1 },
        };
      } /*jika kategori : "semua", harga : "bukan semua", rating: "semua" keyword: "semua"*/ else if (
        kategoriProduct === "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct === "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = { harga: { $gt: +hargaAwal, $lte: +hargaAkhir } };
      } /*jika kategori : "bukan semua", harga : "bukan semua", rating: "bukan semua " keyword: "semua"*/ else if (
        kategoriProduct !== "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct !== "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = {
          kategori: kategoriProduct,
          harga: { $gt: +hargaAwal, $lte: +hargaAkhir },
          rating: { $gte: +ratingProduct, $lte: +ratingProduct + 1 },
        };
      } /*jika kategori : "bukan semua", harga : "semua", rating: "semua" keyword: "semua"*/ else if (
        kategoriProduct !== "semua" &&
        hargaProduct === "semua" &&
        ratingProduct === "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = { kategori: kategoriProduct };
      } /*jika kategori : "bukan semua", harga : "bukan semua", rating: "semua" keyword: "semua"*/ else if (
        kategoriProduct !== "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct === "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = {
          kategori: kategoriProduct,
          harga: { $gt: +hargaAwal, $lte: +hargaAkhir },
        };
      } /*jika kategori : "bukan semua", harga : "bukan semua", rating: "bukan semua" keyword: "semua"*/ else if (
        kategoriProduct !== "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct !== "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = {
          kategori: kategoriProduct,
          harga: { $gt: +hargaAwal, $lte: +hargaAkhir },
          rating: { $gte: +ratingProduct, $lte: +ratingProduct + 1 },
        };
      } /*jika kategori : "semua", harga : "bukan semua", rating: "semua" keyword: "semua"*/ else if (
        kategoriProduct !== "semua" &&
        hargaProduct === "semua" &&
        ratingProduct !== "semua" &&
        keywordProduct === "semua"
      ) {
        filterProduct = {
          kategori: kategoriProduct,
          rating: { $gte: +ratingProduct, $lte: +ratingProduct + 1 },
        };
      } /*jika keyword: "bukan semua" kategori : "semua", harga : "semua", rating: "semua"*/ else if (
        keywordProduct !== "semua" &&
        kategoriProduct === "semua" &&
        hargaProduct === "semua" &&
        ratingProduct === "semua"
      ) {
        filterProduct = { nama: { $regex: keywordProduct, $options: "i" } };
      } /*jika keyword: "bukan semua" kategori : "bukan semua", harga : "semua", rating: "semua"*/ else if (
        keywordProduct !== "semua" &&
        kategoriProduct !== "semua" &&
        hargaProduct === "semua" &&
        ratingProduct === "semua"
      ) {
        filterProduct = {
          nama: { $regex: keywordProduct, $options: "i" },
          kategori: kategoriProduct,
        };
      } /*jika keyword: "bukan semua" kategori : "bukan semua", harga : "bukan semua", rating: "semua"*/ else if (
        keywordProduct !== "semua" &&
        kategoriProduct !== "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct === "semua"
      ) {
        filterProduct = {
          nama: { $regex: keywordProduct, $options: "i" },
          kategori: kategoriProduct,
          harga: { $gt: +hargaAwal, $lte: +hargaAkhir },
        };
      } /*jika keyword: "bukan semua" kategori : "bukan semua", harga : "bukan semua", rating: "bukan semua"*/ else if (
        keywordProduct !== "semua" &&
        kategoriProduct !== "semua" &&
        hargaProduct !== "semua" &&
        ratingProduct !== "semua"
      ) {
        filterProduct = {
          nama: { $regex: keywordProduct, $options: "i" },
          kategori: kategoriProduct,
          harga: { $gt: +hargaAwal, $lte: +hargaAkhir },
          rating: { $gte: +ratingProduct, $lte: +ratingProduct + 1 },
        };
      } else {
        filterProduct = {};
      }

      const totalDocument = await db
        .collection("products")
        .find(filterProduct)
        .count();

      const data = await db
        .collection("products")
        .find(filterProduct)
        .skip(skipDocument)
        .limit(perPage)
        .sort(sortField)
        .toArray();

      return { data, totalDocument };
    } catch (err) {
      console.log(err);
    }
  }

  static async reviewProduct(
    prodId,
    orderId,
    userId,
    userName,
    rating,
    review,
    tanggal
  ) {
    const userAkunId = new mongodb.ObjectId(userId);
    const db = takeDb();
    const cariOrder = await db.collection("orders").findOne({
      _id: new mongodb.ObjectId(orderId),
    });

    for (let i = 0; i < cariOrder.detailOrderan.items.length; i++) {
      if (cariOrder.detailOrderan.items[i].id === prodId) {
        //update isReview
        cariOrder.detailOrderan.items[i].isReview = true;
        cariOrder.detailOrderan.items[i].review = {
          rating,
          review,
          tanggalReview: tanggal,
        };
        await db.collection("orders").updateOne(
          { _id: new mongodb.ObjectId(orderId) },
          {
            $set: { detailOrderan: cariOrder.detailOrderan },
          }
        );
      }
    }

    const cariReviewField = await db
      .collection("products")
      .findOne({ _id: new mongodb.ObjectId(prodId) });

    let result = 0;

    const totalRating = cariReviewField.review.reduce((quantity, item) => {
      result = quantity + rating;
      return result + item.accountInfo.rating;
    }, 0);

    const calcRating = parseFloat(
      (
        totalRating /
        (cariReviewField.review.length === 0
          ? []
          : cariReviewField.review.length + 1)
      ).toFixed(1)
    );
    await db.collection("products").updateOne(
      { _id: new mongodb.ObjectId(prodId) },
      {
        $push: {
          review: {
            _id: new mongodb.ObjectId(),
            accountInfo: {
              userId: userAkunId,
              prodId,
              userName,
              rating,
              review,
              tanggalReview: tanggal,
            },
          },
        },
        $set: {
          rating: isNaN(calcRating) ? rating : calcRating,
        },
      }
    );
  }
}

module.exports = Product;
