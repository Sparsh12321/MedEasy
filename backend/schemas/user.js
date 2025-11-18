const mongoose=require("mongoose");
const userSchema=mongoose.Schema({
    email:String,
    password:String,
    role:{
        type:String,
        default:"customer"
    }
});
const UserModel=mongoose.model("user",userSchema);
module.exports=UserModel;