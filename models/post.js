const mongoose = require('mongoose')

const Schema = mongoose.Schema

const PostSchema = new Schema({
    title: {type:String},
    text: {type:String},
    author: {type: Schema.Types.ObjectId, ref: 'User'},
    timestamp: {type: Date, default: Date.now},
})

module.exports = mongoose.model('Post', PostSchema)