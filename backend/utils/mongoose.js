const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://jainsparsh231_db_user:admin@cluster1.9c7tugw.mongodb.net/MedEasy?retryWrites=true&w=majority&appName=Cluster1",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
)
.then(() => console.log("🔥 MongoDB Connected Successfully"))
.catch((err) => console.log("❌ MongoDB Connection Error:", err));

module.exports = mongoose;