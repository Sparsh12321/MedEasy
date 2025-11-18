const mongoose=require("mongoose");
mongoose.connect("mongodb://localhost:27017/MedEasy")
.then(()=>console.log("Successful"))
.catch((err)=>console.log(err));

