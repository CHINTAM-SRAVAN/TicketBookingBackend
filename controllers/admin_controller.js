import bcyrpt from "bcryptjs";
import Admin from "../models/Admin";
import jwt from "jsonwebtoken";

export const getAllAdmins=async(req,res,next)=>{
    let admins;
    try{ 
        admins= await Admin.find()
    }
    catch(err){
        return console.log(err);
    }

    if (!admins){
        return res.status(500).json({message:"Unexpected Error Occured"});
    }
    return res.status(200).json({ admins });

};
export const addAdmin=async(req,res,next)=>{
    const{email, password }=req.body;

    let exsistingadmin;
    if( !email || 
        email.trim()==="" || 
        !password || 
        password.trim()==""
        ){
        return res.status(422).json({ message: "Invalid Inputs "});
    }
    try{
        exsistingadmin=await Admin.findOne({email});
    }catch(err){
        return console.log(err)
    }

    if(exsistingadmin){
        return res.status(400).json({message:"Admin already exsists"});
    }
    const encryptedPassword=bcyrpt.hashSync(password);

    let admin
    try {

        admin=new Admin({email, password:encryptedPassword});
        admin= await admin.save();
        
    } catch(err) {
        console.log(err);
    }

    if(!admin){
        return res.status(500).json({message:"Unable to add admin"});
    }
    return res.status(200).json({admin});

};

export const adminLogin=async(req,res,next)=>{
    const {email,password}=req.body;
    if( !email || 
        email.trim()==="" || 
        !password || 
        password.trim()==""
        ){
        return res.status(422).json({ message: "Invalid Inputs "});
    }

    let admin;
    try{
        admin= await Admin.findOne({ email });
    }catch(err){
        return console.log(err);
    }

    if(!admin){
        return res.status(400).json({message:"Admin Not Found"});
    }
    const correctPassword=bcyrpt.compareSync(password,admin.password);

    if(!correctPassword){
        return res.status(400).json({message:"Incorrect password"});
    }

    const token= jwt.sign({id:admin._id},process.env.SECRET_KEY,{
        expiresIn:"7d",
    });
    return res.status(200).json({message:"LogedIn Successfully",token,id:admin._id});
};

export const getAdmin=async(req,res,next)=>{
    const id=req.params.id;
    let admin;
    try {
        admin=await Admin.findById(id);
    } catch (err) {
        return console.log(err);
    }
    if(!admin){
        return res.status(500).json({message:"Unable to get user"});
    }

    return res.status(200).json({admin})
}