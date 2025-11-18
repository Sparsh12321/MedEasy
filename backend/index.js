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

app.get("api/customerMedicines",async(req,res)=>{
  const medicines=await RetailerModel.find().populate("Medicines.Medicine_name");
  return res.json(medicines);
});
app.get("api/wholeSalerMedicines",async(req,res)=>{
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

app.post("/login",async(req,res)=>{
  try{
    const{email,password}=req.body;
    await UserModel.create({ email, password });
  }
  catch(err){
    res.status(500).send("Failed");
  }
})
app.listen(3000,()=>console.log("working"));