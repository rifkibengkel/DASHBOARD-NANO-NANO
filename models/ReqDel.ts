// const mongoose = require("mongoose")
import * as mongoose from "mongoose"

const reqDelSch = new mongoose.Schema({
    sender: {
        type: String,
        required: false
    },
    status: {
        type: Number,
        required: false
    },
    filename: {
        type: String,
        required: false,
        default:""
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date
    }
})

const db = mongoose.connection.useDb('logs')

const collection = db.models.request_deletion || db.model('request_deletion', reqDelSch)

export default collection