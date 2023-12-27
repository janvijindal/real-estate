import User from "../models/user.model.js"
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { errorHandler } from '../utils/error.js';
export const signup= async(req,res,next)=>{
      
      console.log(req.body);
      
      //fetch the data from request body
      const {username,email,password}=req.body

      //hash the password
      const hashedpassword=bcryptjs.hashSync(password,10);

      //create new user
      const newUser=new User(
          {
               username,email,password:hashedpassword
          }
      );
     
      //save the user in database
      try{
           await newUser.save();
           res.status(201).json('User created succeesfully.')
      } catch(error){
            console.log(error);
            next(error);
     }
}

export const signin = async(req,res,next)=>{
     //fetch the data from req body
     const { email, password } = req.body;

     try {
      //validate the email of user
       const validUser = await User.findOne({ email });
        //not valid then return error
       if (!validUser) return next(errorHandler(404, 'User not found!'));
        
       //check the password of user and matchj with existing password
       const validPassword = bcryptjs.compareSync(password, validUser.password);

       if (!validPassword) return next(errorHandler(401, 'Wrong credentials!'));

       //now if email and password both correct generate the token for user
       const token = jwt.sign({ id: validUser._id }, process.env.JWT_SECRET);

       const { password: pass, ...rest } = validUser._doc;
       res
         .cookie('access_token', token, { httpOnly: true })
         .status(200)
         .json(rest);
     } catch (error) {
       next(error);
     }
}

export const google = async (req, res, next) => {
     try {
          //get the user
       const user = await User.findOne({ email: req.body.email });
        
       //if valid user
       if (user) {
         const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
         const { password: pass, ...rest } = user._doc;
         res
           .cookie('access_token', token, { httpOnly: true })
           .status(200)
           .json(rest);
       } else {
         const generatedPassword =
           Math.random().toString(36).slice(-8) +
           Math.random().toString(36).slice(-8);
         const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);
         const newUser = new User({
           username:
             req.body.name.split(' ').join('').toLowerCase() +
             Math.random().toString(36).slice(-4),
           email: req.body.email,
           password: hashedPassword,
           avatar: req.body.photo,
         });
         await newUser.save();
         const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
         const { password: pass, ...rest } = newUser._doc;
         res
           .cookie('access_token', token, { httpOnly: true })
           .status(200)
           .json(rest);
       }
     } catch (error) {
       next(error);
     }
   };
   
   export const signOut = async (req, res, next) => {
     try {
       res.clearCookie('access_token');
       res.status(200).json('User has been logged out!');
     } catch (error) {
       next(error);
     }
   };

