// const mongoose = require("mongoose")
import * as mongoose from "mongoose"

const pointRankSch = new mongoose.Schema({
    status: {
        type: Number,
        required: false
    },
    year_month: {
        type: String,
        required: false
    },
    user_rank: [{
            rankNumber: {
                type: String,
                required: false
            },
            point: {
                type: Number,
                required: false
            },
            user: [{
                id: {
                    type: Number,
                    required: false
                },
                name: {
                    type: String,
                    required: false
                },
                sender: {
                    type: String,
                    required: false
                },
                ktp: {
                    type: String,
                    required: false
                },
                image: {
                    type: String,
                    required: false
                }
            }]
    }],
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
}, {collection: "point_rank"})

const db = mongoose.connection.useDb('point')

const collection = db.models.point || db.model("point_rank", pointRankSch)

export default collection