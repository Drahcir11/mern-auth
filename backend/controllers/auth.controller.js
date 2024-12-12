import { User } from "../models/user.model.js";
import bcryptjs from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/email.js";

export const signup = async (req, res) => {
    const { email, password, name} = req.body;
    console.log("sign up request")
    try {

        if(!email || !password || !name){
            throw new Error("All fields are required");
        }

        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false, message: "User already exists"});
        }

        const hashedPassword = await bcryptjs.hash(password, 10);
        const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();
        const user = new User({
            email,
            password: hashedPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        });

        await user.save();

        generateTokenAndSetCookie(res, user._id);

        sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user: {
                ...user._doc,
                password: undefined,
            },
        });
    }
    catch (error){
        res.status(400).json({success:false, message: error})
    }
}

export const login = async (req, res) => {
    res.send("Login route");
}

export const logout = async (req, res) => {
    res.send("Logout route");
}

export const verifyEmail = async (req,res) => {
    const { email, verificationToken } = req.body;

    try{
        const user = await User.findOne({email, verificationToken, verificationTokenExpiresAt: {$gt: Date.now()}});

        if (!user) {
            res.status(400).json({success: false, message: "User verification failed"});
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt =  undefined;

        await user.save();

        res.status(200).json({sucess: true, message:"User verified"});
    }
    catch(error){
        console.error("Error verifying user email: ", error);
    }
}