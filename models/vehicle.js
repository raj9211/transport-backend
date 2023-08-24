"use strict";
const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const VehicleSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    number: {
        type: String,
        required: [true, "Number is required"],
    },
    rc: {
        type: String,
        required: [true, "RC is required"],
    },
    insurance: {
        type: String,
        required: [true, "Insurance is required"],
    },
    tax: {
        type: String,
        required: [true, "Tax is required"],
    },
    assets: {
        type: String,
        default: ""
    },
    year: {
        type: String,
        default: ""
    },
    // companyId: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Company",
    //     required: [true, "Company id is required"],
    // },
    deleted: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    deletedAt: {
        type: Date,
        default: Date.now,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Creator is required"],
    },
},
    { collection: "vehicles", timestamps: true }
);

VehicleSchema.index({ number: 1, }, { unique: true });

module.exports = mongoose.model("Vehicle", VehicleSchema);

// module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
