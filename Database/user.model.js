import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required:true,
        minlength:3
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        index:true
    },
    hashedPassword:{
        type:String,
        required:true
    },
    refreshToken:{
        type:String,
        default:null
    }
},{
    timestamps:true,
});



userSchema.methods.logout = async function (){
  this.refreshToken = null;
  return await this.save();
};
userSchema.methods.setRefreshToken = async function (newRefreshToken){
  this.refreshToken = newRefreshToken;
  return await this.save();
};




userSchema.virtual("projects",{
    ref:"Project",
    localField:"_id",
    foreignField:"owner"
});
userSchema.pre("save",async (next)=>{
    console.log("pre save running");
})

const User = mongoose.model("User",userSchema);
export default User;