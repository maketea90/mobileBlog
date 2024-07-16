const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CommentSchema = new Schema({
    message: {type: String},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    timestamp: {type: Date, default: Date.now},
    post: {type: Schema.Types.ObjectId, ref: 'Post'}
})

module.exports = mongoose.model('Comment', CommentSchema)