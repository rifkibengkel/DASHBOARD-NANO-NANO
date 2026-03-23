// const mongoose = require("mongoose")
import * as mongoose from "mongoose"

const couponSch = new mongoose.Schema({
    coupon: {
        type: String,
        required: false
    },
    prizeId: {
        type: Number,
        required: true
    },
    periodeId: {
        type: Number,
        required: true
    },
    promoId: {
        type: Number,
        required: true
    },
    status: {
        type: Number,
        required: false
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date
    }
})

const db = mongoose.connection.useDb('nanonano')

const collection = db.models.coupon || db.model('coupon', couponSch)

export default collection