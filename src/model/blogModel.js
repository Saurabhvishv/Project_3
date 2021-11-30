const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId
const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    authorId: {
        type: ObjectId,
        ref: 'Author project one'
    },
    tags: [String],
    category: {
        type: [String],
        required: true
    },
    subcategory: [String],
    deletedAt: Date,
    isDeleted: {
        type: Boolean,
        default: false
    },
    publishedAt: {
        type: Date
    },
    isPublished: {
        type:Boolean,
        default: false
    }
}, { timestamps: true })
module.exports = mongoose.model('blog project one', blogSchema)