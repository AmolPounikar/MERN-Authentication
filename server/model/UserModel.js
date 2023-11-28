import mongoose from "mongoose";

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please provide Unique Username"],
        unique: [true, "Username Exist"],
    },

    password: {
        type: String,
        required: [true, "Please provide a Password"],
        unique: false,
    },
    email: {
        type: String,
        required: [true, "please provide a Unique email"],
        unique: true,
    },
    firstName: { type: String },
    lastName: { type: String },
    mobile: { type: String },
    adress: { type: String },
    profile: { type: String },
});

export default mongoose.model.USers || mongoose.model("User", UserSchema);
