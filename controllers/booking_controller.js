import mongoose from "mongoose";
import Bookings from "../models/Bookings.js";
import Movie from "../models/Movie.js";
import User from "../models/User.js";
export const getAllBookings=async(req,res,next)=>{
    
    let bookings;
    try{ 
        bookings= await Bookings.find()
    }
    catch(err){
        return console.log(err);
    }

    if (!bookings){
        return res.status(500).json({message:"Unexpected Error Occured"});
    }
    return res.status(200).json({ bookings });

};

export const newBooking=async(req,res,next)=>{
    const {movie,date,seatNumber,user}=req.body;
    let exsistingMovie;
    let exsistingUser;
    try {
        exsistingMovie= await Movie.findById(movie);
        exsistingUser= await User.findById(user);
    } catch (err) {
        console.log(err)
    }
    if(!exsistingMovie){
        return res.status(404).json({message:"Movie not Found"});
    }
    if(!exsistingUser){
        return res.status(404).json({message:"User not Found"});
    }
    const existingBooking = await Bookings.findOne({
        movie:movie,
        seatNumber: seatNumber,
        date: date,
    });

    if (existingBooking) {
        return res.status(400).json({
            message: "Booking for this seat is not available for the given date",
        });
    }
    let Booking;
    try {
        Booking=new Bookings({
            movie,
            date: new Date(`${date}`),
            seatNumber,
            user,   
        })

        const session=await mongoose.startSession();
        session.startTransaction()
        exsistingUser.bookings.push(Booking);
        exsistingMovie.bookings.push(Booking);
        await exsistingUser.save({session});
        await exsistingMovie.save({session});
        await Booking.save({session});
        session.commitTransaction();
    } catch (err) {
        return console.log(err)
    }

    
    if(!Booking){
        return res.status(500).json({message:"Unable to create a booking"})
    }

    return res.status(201).json({message:"Booking created successfully"})
    
};


export const getBookingsByDate = async (req, res, next) => {
    const { movie, date } = req.body;
    try {
        // Convert the date string to a Date object
        const searchDate = new Date(date);

        // Use find to get an array of documents
        const foundBookings = await Bookings.find({
            movie: movie,
            date: searchDate,
        });
        // Return the found bookings
        return res.status(200).json({ bookings: foundBookings });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unexpected Error" });
    }
};



export const getBookingById = async(req,res,next)=>{
    const id=req.params.id;
    let booking;

    try {
        booking=await Bookings.findById(id);
    } catch (err) {
        return console.log(err);
    }

    if(!booking){
        return res.status(500).json({message:"Unexpected Error"});
    }
    return res.status(200).json({booking})
};
export const deleteBookingById = async(req,res,next)=>{
    const id=req.params.id;
    let booking;

    try {
        booking=await Bookings.findByIdAndDelete(id).populate("user movie");
        const session=await mongoose.startSession();
        session.startTransaction();
        await booking.user.bookings.pull(booking);
        await booking.movie.bookings.pull(booking);
        await booking.movie.save({session});
        await booking.user.save({session});
        session.commitTransaction();
    } catch (err) {
        return console.log(err);
    }
    
    if(!booking){
        return res.status(500).json({message:"Unable to Delete Booking"});
    }
    return res.status(200).json({message:"Deleted Successfully"});

};
