// const mongoose = require("mongoose")
import * as mongoose from "mongoose"

const entryLogsSch = new mongoose.Schema({
    id: {
        type: Number,
    },
    message: {
        type: String,
    },
    messageId: {
        type: String,
    },
    from: {
        type: Number,
    },
    to: {
        type: Number,
    },
    mediaType: {
        type: String,
    },
    media: {
        type: String,
    },
    waName: {
        type: String,
    },
    receiveTime: {
        type: Date,
    },
    is_delete: {
        type: Number,
    },
    deleted_at: {
        type: Date,
    },
    created_at: {
        type: Date,
    },
    updated_at: {
        type: Date
    }
}, {collection: "incoming_message"})

const db = mongoose.connection.useDb('logs')

const collection = db.models.incoming_message || db.model("incoming_message", entryLogsSch)

export default collection