import mongoose, { Document } from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: "user",
        enum: ["user", "partner", "admin"]
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        type: String
    },
    otpExpiresAt: {
        type: Date
    },
    partnerOnBoardingSteps: {
        type: Number,
        min: 0,
        max: 8,
        default: 0
    },
    mobileNumber: {
        type: String
    },
    partnerStatus: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending"
    },
    rejectionReason: {
        type: String
    },
    videoKycStatus: {
        type: String,
        enum: ["not_required", "pending", "approved", "rejected", "in_progress"],
        default: "not_required"
    },
    videoKycRoomId: {
        type: String
    },
    videoKycRejectionReason: {
        type: String
    },
    isOnline: {
        type: Boolean,
        default: false,
        index: true
    },
    socketId: {
        type: String,
    },
    location: {
        type: {
            type: String,
            enum: ["Point"],
        },
        coordinates: [Number]
    }
}, {timestamps: true})

userSchema.index({ location: "2dsphere" })

const User = mongoose.model('User', userSchema)
export default User