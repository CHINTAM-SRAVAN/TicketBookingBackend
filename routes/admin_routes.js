import express from "express";
import { getAllAdmins, adminLogin, addAdmin, getAdmin } from "../controllers/admin_controller.js";

const adminRouter=express.Router();
adminRouter.get("/", getAllAdmins);
adminRouter.post("/signup",addAdmin);
adminRouter.post("/login",adminLogin);
adminRouter.get("/:id",getAdmin);
export default adminRouter;