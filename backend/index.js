const express=require("express");
const app=express();
const fs = require("fs");
const data = JSON.parse(fs.readFileSync("public/data.json", "utf8"));
const mongoose=require("./utils/mongoose")
const MedcineModel=require("./schemas/medicines");
const RetailerModel=require("./schemas/retailer");
const WholesalerModel=require("./schemas/wholesaler");
const UserModel=require("./schemas/user");
const cors = require("cors");
app.use(express.json());
app.use(cors());
const filteredData = data.map(item => ({
  Medicine_name: item["Medicine name"],
  Brand: item["Source/Brand"],
  Image: item["Image"]
}));
const RetailerData = data.map(item => ({
  Name: item["Retailer"],
  Latitude: item["Latitude"],
  Longitude: item["Longitude"]
}));
const WholerSalerData = data.map(item => ({
  Name: item["Supplier/Distributor"],
  Latitude: item["Latitude"],
  Longitude: item["Longitude"]
}));

app.get("/api/customerMedicines",async(req,res)=>{
  const medicines=await RetailerModel.find().populate("Medicines.Medicine_name");
  return res.json(medicines);
});
app.get("/api/wholeSalerMedicines",async(req,res)=>{
  const medicines=await WholesalerModel.find().populate("Medicines.Medicine_name");
  return res.json(medicines);
});

// app.get("/medicines", async (req, res) => {
//   try {
//     await MedcineModel.insertMany(filteredData);
//     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
//   } catch (err) {
//     console.error("❌ Error inserting:", err);
//     res.status(500).send("Error inserting data");
//   }
// });
// app.get("/retailers", async (req, res) => {
//   try {
//     await RetailerModel.insertMany(RetailerData);
//     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
//   } catch (err) {
//     console.error("❌ Error inserting:", err);
//     res.status(500).send("Error inserting data");
//   }
// });
// app.get("/wholesalers", async (req, res) => {
//   try {
//     await WholesalerModel.insertMany(WholerSalerData);
//     res.send("✅ Medicines inserted successfully (name, brand, image only)!");
//   } catch (err) {
//     console.error("❌ Error inserting:", err);
//     res.status(500).send("Error inserting data");
//   }
// });

// app.get("/populate",async(req,res)=>{
//     const meds = await MedcineModel.find({}, "_id");
//     const formatted = meds.map(m => ({ Medicine_name: m._id, Quantity: 50 }));
//     const result = await RetailerModel.updateMany({}, { $set: { Medicines: formatted } });
//     const resss = await WholesalerModel.updateMany({}, { $set: { Medicines: formatted } });
//     res.json({ success: true, modifiedCount: result.modifiedCount });

  
// })

// CUSTOMER SIGNUP  -------------------------------------------------
app.post("/signup", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // role defaults to "customer" from schema
    const user = await UserModel.create({
      email,
      password,
      role: role || "customer",
    });

    return res.status(201).json({
      message: "Signup successful",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Signup failed" });
  }
});

// CUSTOMER LOGIN  --------------------------------------------------
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.findOne({
      email,
      password,
      role: "customer",
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    return res.json({
      message: "Login successful",
      userId: user._id,
      role: user.role,
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// RETAILER / WHOLESALER LOGIN  ------------------------------------
app.post("/partner-login", async (req, res) => {
  try {
    const { email, password, role } = req.body; // "retailer" | "wholesaler" (frontend)

    const normalizedRole = role?.toLowerCase();

    if (!["retailer", "wholesaler"].includes(normalizedRole)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Case-insensitive match on role so it works even if DB has "Wholesaler"
    const user = await UserModel.findOne({
      email,
      password,
      role: { $regex: new RegExp(`^${normalizedRole}$`, "i") },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    return res.json({
      message: "Partner login successful",
      userId: user._id,
      role: normalizedRole, // always send lowercase to frontend
    });
  } catch (err) {
    console.error("Partner login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

app.listen(3000,()=>console.log("working"));
