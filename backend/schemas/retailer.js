const mongoose=require("mongoose"); 
const RetailerSchema=mongoose.Schema({
    
    Name:String,
    Medicines: [
    {
      Medicine_name: {type:mongoose.Schema.Types.ObjectId,  
      ref: "medicine"}, 
      Quantity: { type: Number, default: 0 }
    }
  ],
    Suppliers:[],
    Latitude:Number,
    Longitude:Number
});

 const RetailerModel=mongoose.model("retailer",RetailerSchema);
 module.exports=RetailerModel;