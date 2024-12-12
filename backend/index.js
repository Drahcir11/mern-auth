import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";

const app = express();
dotenv.config();

const port = process.env.PORT

app.get("/", (req,res)=>{
    res.send("Hello world!")
})

app.use(express.json());
app.use("/api/auth", authRoutes);

app.listen(port, ()=>{
    connectDB();
    console.log(`listening at port ${port}`)
})
