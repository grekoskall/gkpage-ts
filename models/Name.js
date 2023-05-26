const mongoose = require('mongoose')

const nameSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    roles: {
        type: [String],
        default: ["Persona"]
    },
    active: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('Name', nameSchema)