const mongoose = require("mongoose");

// Re-useable mongoose connection utility.
// Exporting the connected mongoose instance keeps existing behavior
// (connection is created on first require) while making the module
// actually useful to other files.
const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://jainsparsh231_db_user:admin@cluster1.9c7tugw.mongodb.net/?appName=Cluster1";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connection successful"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

module.exports = mongoose;
