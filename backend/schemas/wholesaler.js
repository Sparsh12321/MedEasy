const mongoose=require("mongoose"); 
const RetailerSchema=mongoose.Schema({
    
    Name:String,
    Medicines: [
    {
      Medicine_name: {type:mongoose.Schema.Types.ObjectId},  
      Quantity: { type: Number, default: 0 }
    }
  ],
    Wholesaler:[],
    Latitude:Number,
    Longitude:Number
});

 const RetailerModel=mongoose.model("Wholesaler",RetailerSchema);
 module.exports=RetailerModel;

