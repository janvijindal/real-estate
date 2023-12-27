import express from "express";
import mongoose from "mongoose"
import dotenv from "dotenv"
import userRouter from "./routes/user.route.js"
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from 'cookie-parser';
import cors from "cors"
import path from 'path';

//connection to database
dotenv.config();
mongoose.connect(process.env.MONGODB_URL).then(()=>{
       console.log("connection is establish to db")
     }).catch((err)=>{
          console.log(err);
     })

     const __dirname = path.resolve();

//creating app
const app=express();

// Enable CORS for all routes
app.use(cors());


//to use the json
app.use(express.json());

app.use(cookieParser());

//checking our app is working or not
app.listen(3000,()=>{
       console.log("the server is running on port 3000..")
})

//routes
app.use('/api/user',userRouter);
app.use('/api/auth',authRouter);
app.use('/api/listing',listingRouter);

app.use(express.static(path.join(__dirname, '/client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html'));
})


//middleware
app.use((err, req, res, next) => {
     const statusCode = err.statusCode || 500;
     const message = err.message || 'Internal Server Error';
     return res.status(statusCode).json({
       success: false,
       statusCode,
       message,
     });
   });