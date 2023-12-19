import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRouter from "./routes/user_routes.js";
import adminRouter from "./routes/admin_routes.js";
import movieRouter from "./routes/movie_routes.js";
import bookingRouter from "./routes/booking_routes.js";
import cors from 'cors';


dotenv.config();
const app=express();

app.use(cors());
app.use(express.json());
app.use("/user",userRouter);
app.use("/admin",adminRouter);
app.use("/movie",movieRouter);
app.use("/booking",bookingRouter);

mongoose
.connect(
    `mongodb+srv://chintamsravankumar:${process.env.MONGODB_PASSWORD}@cluster0.adzmobo.mongodb.net/`
)
.then(()=>
    app.listen(5000,()=>
        console.log("Connected to Database and server is running")
        )
    ).catch(e=>console.log(e));