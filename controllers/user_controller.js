import Bookings from "../models/Bookings.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
export const getAllUsers=async(req,res,next)=>{
    let users;
    try{ 
        users= await User.find()
    }
    catch(err){
        return console.log(err);
    }

    if (!users){
        return res.status(500).json({message:"Unexpected Error Occured"});
    }
    return res.status(200).json({ users });

};

export const signup= async (req,res,next) => {
     const {name,email,password}=req.body;
     if(!name || 
        name.trim()==="" || 
        !email || 
        email.trim()==="" || 
        !password || 
        password.trim()==""
        ){
        return res.status(422).json({ message: "Invalid Inputs "});
     }
     const encryptedPassword=bcrypt.hashSync(password)
     let user;
     try{
        user=new User({name,email,password:encryptedPassword});
        user= await user.save();

     }catch(err){
        return console.log(err);
     }
     console.log(user);

     if (!user){
        return res.status(500).json({message:"Unexpected Error Occured"});
    }
    return res.status(201).json({id:user._id });

};

export const updateUser=async(req,res,next)=>{
        const id=req.params.id;
        const {name,email,password}=req.body;
        if(!name || 
            name.trim()==="" || 
            !email || 
            email.trim()==="" || 
            !password || 
            password.trim()==""
            ){
            return res.status(422).json({ message: "Invalid Inputs "});
        }
        let user;
        const encryptedPassword=bcrypt.hashSync(password)
        try{
           user= await User.findByIdAndUpdate(id,{name,email,password:encryptedPassword});
        }catch(err){
           return console.log(err);
        }
        if (!user){
            return res.status(500).json({message:"Something went wrong"});
        }
        return res.status(200).json({message:"Updated Successfully"});

};

export const deleteUser= async (req,res,next)=>{
    const id= req.params.id;
    let user;
    try{
        user= await User.findByIdAndDelete(id);
    }catch(err){
        return console.log(err);
    }
    if (!user){
        return res.status(500).json({message:"Something went wrong"});
    }
    return res.status(200).json({message:"Deleted Successfully"});
};


export const login=async(req,res,next)=>{
    const {email,password}=req.body;
    if( !email || 
        email.trim()==="" || 
        !password || 
        password.trim()==""
        ){
        return res.status(422).json({ message: "Invalid Inputs "});
    }

    let user;
    try{
        user= await User.findOne({ email });
    }catch(err){
        return console.log(err);
    }

    if(!user){
        return res.status(404).json({message:"User Not Found"});
    }
    const correctPassword=bcrypt.compareSync(password,user.password);

    if(!correctPassword){
        return res.status(400).json({message:"Incorrect password"});
    }

    return res.status(200).json({message:"LogedIn Successfully",id:user.id});
};

export const getBookingsOfUser=async(req,res,next)=>{
    const id=req.params.id;
    let bookings;
    try {
        bookings=await Bookings.find({user:id});
    } catch (err) {
        return console.log(err);
    }
    if(!bookings){
        return res.status(500).json({message:"Unable to get bookings"});
    }

    return res.status(200).json({bookings})
}

export const getUser=async(req,res,next)=>{
    const id=req.params.id;
    let user;
    try {
        user=await User.findById(id);
    } catch (err) {
        return console.log(err);
    }
    if(!user){
        return res.status(500).json({message:"Unable to get user"});
    }

    return res.status(200).json({user})
}
