import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import Movie from "../models/Movie.js";
import Admin from "../models/Admin.js";
import Bookings from "../models/Bookings.js";

export const getAllMovies=async(req,res,next)=>{
    let movies;
    try{ 
        movies= await Movie.find()
    }
    catch(err){
        return console.log(err);
    }

    if (!movies){
        return res.status(500).json({message:"Unexpected Error Occured"});
    }
    return res.status(200).json({movies});

};

export const addMovie=async(req,res,next)=>{
     const extractedToken=req.headers.authorization.split(" ")[1];
     if (!extractedToken || extractedToken.trim()===""){
        return res.status(404).json({message:"Token Not Found"});
     }
     let adminId;

     //verify token
     //return console.log(extractedToken.substr(7));
     jwt.verify(extractedToken,process.env.SECRET_KEY,(err,decrypted)=>{
        if(err){
            return res.status(400).json({message:`${err.message}`});
        }else{
            adminId=decrypted.id;
            return;
        }
     })
     //Create Movie
     const { title,description,actors,releaseDate,posterUrl,featured,seats}=req.body;
     if(
        !title ||
        title.trim()==="" ||
        !description ||
        description.trim()==="" ||
        !posterUrl ||
        posterUrl.trim()===""
        ){
            return res.status(422).json({message:"Invalid Inputs"})
        }
    
        let movie;
        try {
            movie= new Movie({
                title,
                description,
                actors,
                releaseDate: new Date(`${releaseDate}`),
                featured,
                admin:adminId,
                posterUrl,
                seats,
            });
        
        const session= await mongoose.startSession();
        const adminUser= await Admin.findById(adminId);
        session.startTransaction();
        await movie.save({session});

        adminUser.addedMovies.push(movie);
        await adminUser.save({session});
        await session.commitTransaction();

        } catch (err) {
           return console.log(err);
        }

        if(!movie){
            return res.status(500).json({message:"Request Failed"})
        }

        return res.status(201).json({movie})

};

export const getMovieById=async(req,res,next)=>{
    const id=req.params.id;
    let movie;
    try{
        movie= await Movie.findById(id)
    }catch(err){
        return console.log(err)
    }
    if(!movie){
        return res.status(500).json({message:"Invalid Movie Id"})
    }

    return res.status(200).json({movie})
};

export const deleteMovie = async (req, res, next) => {
    try {
        // Extract token from headers
        const extractedToken = req.headers.authorization.split(" ")[1];

        // Check if token is missing
        if (!extractedToken || extractedToken.trim() === "") {
            return res.status(404).json({ message: "Token Not Found" });
        }

        let adminId;

        // Verify token
        jwt.verify(extractedToken, process.env.SECRET_KEY, (err, decrypted) => {
            if (err) {
                return res.status(400).json({ message: `${err.message}` });
            } else {
                adminId = decrypted.id;
            }
        });

        // Create Movie
        const id = req.params.id;

        // Find and delete movie
        const movie = await Movie.findByIdAndDelete(id).populate("bookings admin");

        if (!movie) {
            return res.status(500).json({ message: "Request Failed" });
        }

        // Start a mongoose session for transactions
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // Find booking IDs related to the movie
            const bookingIds = await Bookings.find({ movie: id }).select('_id');

            // Delete bookings
            await Bookings.deleteMany({ _id: { $in: bookingIds } });

            // Remove movie from admin's addedMovies array
            await movie.admin.addedMovies.pull(movie);
            await movie.admin.save({ session });

            // Commit the transaction
            await session.commitTransaction();
        } catch (error) {
            // If any error occurs during the transaction, rollback
            await session.abortTransaction();
            throw error;
        } finally {
            // Close the session
            session.endSession();
        }

        return res.status(201).json({ message: "Deleted Successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};
