const Name = require('../models/Name')
const Note = require('../models/Note')
const bcrypt = require('bcrypt')

// @desc Get all Names
// @route GET /names
// @access Private
const getAllNames = async (req, res) => {
    const names = await Name.find().select('-password').lean()
    if (!names?.length) {
        return res.status(400).json({ message: "Empty" })
    }
    res.json(names)
}

// @desc Create new name
// @route POST /names
// @access Private
const createNewName = async (req, res) => {
    const { name, password, roles } = req.body

    // Verification
    if (!name || !password ) {
        return res.status(400).json({message: "Missing information"})
    }

    // Unique
    const unique = await Name.findOne({ name }).collation({locale: 'en', strength: 2}).lean().exec()

    if (unique) {
        return res.status(409).json({ message: "Name already exists"})
    }

    // Password Handling
    const pwdHash = await bcrypt.hash(password, 10)

    const nameObject = (!Array.isArray(roles) || !roles.length)
        ? { name, "password": pwdHash }
        : { name, "password": pwdHash, roles} 

    // Post
    const username = await Name.create(nameObject)

    if (username) {
        res.status(201).json({message: `Created new name: ${name}`})
    } else {
        res.status(400).json({message: 'Couldn\'t create name'})
    }
}

// @desc Update a name
// @route PATCH /names
// @access Private
const updateName = async (req, res) => {
    const { id, username, roles, active, password } = req.body

    // Verification
    if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({ message: "Missing information"})
    }
    
    const name = await Name.findById(id).collation({locale: 'en', strength: 2}).exec()

    if (!name) {
        return res.status(400).json({message: "Name doens\'t exist"})
    }

    // Unique 
    const unique = await Name.findOne({username}).lean().exec()
    // Allow update
    if (unique && unique?._id.toString() !== id) {
        return res.status(409).json({message: "Name already exists"})
    }

    name.username = username
    name.roles = roles
    name.active = active
    if (password) {
        name.password = await bcrypt.hash(password, 10)
    }

    const updatedName = await name.save()

    res.json({message: `Updated name: ${updatedName.username}`})
}

// @desc Delete a name
// @route DELETE /names
// @access Private
const deleteName = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.status(400).json({message: "Missing id"})
    }

    const note = await Note.findOne({ name: id}).lean().exec()
    if (note) {
        return res.status(400).json({message: "Name is VIM"})
    }

    const name = await Name.findById(id).exec()

    if (!name) {
        return res.status(400).json({message: "Name not found"})
    }

    const result = await name.deleteOne()

    const reply = `Name: ${result.username} with ID: ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllNames, 
    createNewName,
    updateName,
    deleteName
}