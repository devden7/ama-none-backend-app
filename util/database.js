const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;
const connectDb = async (callback) => {
  try {
    const data = await MongoClient.connect(
      `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.zpfzyiz.mongodb.net/${process.env.MONGO_DEFAULT_DATA}?retryWrites=true&w=majority&ssl=true`
    );
    _db = data.db();
    callback();
  } catch (err) {
    console.log(err);
    throw err;
  }
};

//check database
const takeDb = () => {
  if (_db) {
    return _db;
  }
  throw "Tidak Ada database";
};
exports.connectDb = connectDb;
exports.takeDb = takeDb;
