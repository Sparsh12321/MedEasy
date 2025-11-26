const mongoose=require("mongoose");
const MedicineSchema=mongoose.Schema({
    
    Medicine_name:String,
    Brand:String,
    Image:String
})

 const MedcineModel=mongoose.model("medicine",MedicineSchema);
 module.exports=MedcineModel;