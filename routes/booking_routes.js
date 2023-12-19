import express from "express";
import { deleteBookingById, getAllBookings, getBookingById, getBookingsByDate, newBooking } from "../controllers/booking_controller";

const bookingRouter=express.Router();

bookingRouter.post("/",newBooking)
bookingRouter.post("/bookingsByDate",getBookingsByDate)
bookingRouter.get("/:id",getBookingById)
bookingRouter.get("/",getAllBookings)
bookingRouter.delete("/:id",deleteBookingById)

export default bookingRouter