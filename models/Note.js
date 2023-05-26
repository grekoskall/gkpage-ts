const mongoose = require('mongoose')
const AutoIncrement = require('mongoose-sequence')(mongoose)

const noteSchema = new mongoose.Schema(
    {
        name: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Name'
        },
        title: {
            type: String,
            required: true
        },
        text: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Note', noteSchema)