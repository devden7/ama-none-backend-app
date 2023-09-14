const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const mongodb = require("mongodb");
const takeDb = require("../util/database").takeDb;
//const cartItems = [];
const ObjectId = mongodb.ObjectId;
class User {
  constructor(id, nama, email, password, cart, role) {
    this._id = new mongodb.ObjectId(id);
    this.nama = nama;
    this.email = email;
    this.password = password;
    this.cart = cart;
    this.role = role;
  }

  async save() {
    const db = takeDb();
    const data = await db.collection("users").insertOne(this);

    return data;
  }

  static async initAccount(userId) {
    const db = takeDb();
    if (!userId) {
      const error = new Error("Silahkan login terlebih dahulu");
      error.statusCode = 401;
      throw error;
    }

    const user = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    this._id = user._id;
    this.nama = user.nama;
    this.email = user.email;
    this.password = user.password;
    this.cart = user.cart;
    this.role = user.role;
  }

  static async findUser(email, password) {
    //jika user tidak memasukan email sama sekali
    if (!email) {
      const error = new Error("Silahkan masukan email");
      error.statusCode = 401;
      throw error;
    }

    //jika user tidak memasukan password sama sekali
    if (!password) {
      const error = new Error("Silahkan masukan password");
      error.statusCode = 401;
      throw error;
    }

    const db = takeDb();
    const user = await db.collection("users").findOne({ email: email });

    //jika user memasukan email tapi email tersebut tidak ada
    if (!user) {
      const error = new Error("Email Tidak ditemukan");
      error.statusCode = 401;
      throw error;
    }

    const comparePassword = await bcrypt.compare(password, user.password);

    let createTokenUser;

    //jika user memasukan password tapi email tersebut tidak ada
    if (!comparePassword) {
      const error = new Error("Password salah");
      error.statusCode = 401;
      throw error;
    }

    this._id = user._id;
    this.nama = user.nama;
    this.email = user.email;
    this.password = user.password;
    this.cart = user.cart;
    this.role = user.role;

    createTokenUser = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "testjwtlogin",
      { expiresIn: "1h" }
    );
    return {
      token: createTokenUser,
      userId: user._id.toString(),
      userName: user.nama,
      email: user.email,
      role: user.role,
    };
  }

  static async changePasswordUser(email, newPassword) {
    const db = takeDb();

    await db
      .collection("users")
      .updateOne({ email: email }, { $set: { password: newPassword } });
  }

  static async addToCart(product) {
    const db = takeDb();
    const cariItemIndex = this.cart.findIndex(
      (itemIndex) => itemIndex.id === product.id
    );

    let itemInCart;

    const itemReady = this.cart[cariItemIndex];

    if (itemReady) {
      const newQuantity = itemReady.quantityItem + 1;

      itemReady.quantityItem = newQuantity;

      const updateItemTersedia = {
        ...itemReady,
      };

      itemInCart = [...this.cart];

      itemInCart[cariItemIndex] = updateItemTersedia;
    } else {
      itemInCart = product;
      this.cart.push(itemInCart);
    }

    const data = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: this.cart } }
      );

    return data;
  }

  static async getFromCart(userId) {
    const db = takeDb();
    const data = await db
      .collection("users")
      .find({ _id: new ObjectId(this._id || userId) })
      .toArray();
    return data;
  }

  static async reduceQuantityCart(id, userId) {
    // 1. cari index dari item cart
    const cariItemIndex = this.cart.findIndex(
      (itemIndex) => itemIndex.id === id
    );
    const itemReady = this.cart[cariItemIndex];

    let itemInCart;

    if (itemReady.quantityItem === 1) {
      itemInCart = this.cart.filter((itemIndex) => {
        return itemIndex.id !== id;
      });
    } else {
      const newQuantity = itemReady.quantityItem - 1;

      itemReady.quantityItem = newQuantity;

      const updateItemTersedia = {
        ...itemReady,
      };

      itemInCart = [...this.cart];

      itemInCart[cariItemIndex] = updateItemTersedia;
    }
    this.cart = itemInCart;

    const db = takeDb();

    const data = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { cart: itemInCart } });

    return data;
  }

  static async deleteItemCart(id) {
    const deleteCart = this.cart.filter((item) => {
      return item.id !== id;
    });
    this.cart = deleteCart;

    try {
      const db = takeDb();
      await db
        .collection("users")
        .updateOne(
          { _id: new ObjectId(this._id) },
          { $set: { cart: deleteCart } }
        );
    } catch (err) {
      console.log(err);
    }
  }

  static async postOrder(
    userInfoPenerima,
    tanggal,
    totalBelanja,
    pembayaran,
    statusOrder
  ) {
    const db = takeDb();
    try {
      const findCartUser = await db
        .collection("users")
        .findOne({ _id: new ObjectId(this._id) });

      if (findCartUser) {
        await db.collection("orders").insertOne({
          accountInfo: { _id: findCartUser._id, namaAkun: findCartUser.nama },
          detailOrderan: {
            userInfoPenerima,
            tanggalOrder: tanggal,
            totalBelanja,
            pembayaran: pembayaran.viaPembayaran,
            statusOrder,
            items: findCartUser.cart,
          },
        });

        await db
          .collection("users")
          .updateOne({ _id: findCartUser._id }, { $set: { cart: [] } });
        this.cart = [];
      }
    } catch (err) {
      console.log(err);
    }
  }

  static async getOrderData(id) {
    const db = takeDb();
    const findCartUser = await db
      .collection("users")
      .findOne({ _id: new ObjectId(id) });
    const data = await db
      .collection("orders")
      .find({
        "accountInfo._id": new ObjectId(findCartUser._id),
      })
      .toArray();

    return data;
  }

  static async findOrderById(id) {
    const db = takeDb();
    const data = await db
      .collection("orders")
      .find({ _id: new ObjectId(id) })
      .next();
    return data;
  }

  static async findUserList() {
    const db = takeDb();

    const data = await db
      .collection("users")
      .find()
      .project({ _id: 1, nama: 1, email: 1 })
      .toArray();
    return data;
  }

  static async deleteUserById(id) {
    const db = takeDb();
    const adminId = "64e03d45fbc0ccb87f631f5a";

    if (id === adminId) {
      const error = new Error("Tidak bisa menghapus Admin");
      error.statusCode = 401;
      throw error;
    }

    await db.collection("users").deleteOne({ _id: new ObjectId(id) });
  }

  static async getListAllOrder() {
    const db = takeDb();
    const data = await db.collection("orders").find().toArray();
    return data;
  }

  static async getSingleOrder(id) {
    const db = takeDb();

    const data = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    return data;
  }

  static async updatePengiriman(id, status) {
    const db = takeDb();
    const cariProduct = await db.collection("products").find().toArray();

    const cariOrder = await db
      .collection("orders")
      .findOne({ _id: new ObjectId(id) });

    const cariIdItemOrder = cariOrder.detailOrderan.items;

    for (let i = 0; i < cariIdItemOrder.length; i++) {
      for (let j = 0; j < cariProduct.length; j++) {
        if (
          new ObjectId(cariIdItemOrder[i].id).toString() ===
          cariProduct[j]._id.toString()
        ) {
          const newStok =
            +cariProduct[j].stok - cariIdItemOrder[i].quantityItem;

          const stok = await db
            .collection("products")
            .updateOne(
              { _id: cariProduct[j]._id },
              { $set: { stok: newStok } }
            );
        }
      }
    }

    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          "detailOrderan.statusOrder": status,
        },
      }
    );
  }
}

module.exports = User;
