const Note = require('../models/Note')
const Name = require('../models/Name')

// @desc Get all notes 
// @route GET /notes
// @access Private
const getAllNotes = async (req, res) => {
    const notes = await Note.find().lean()

    if (!notes?.length) {
        return res.status(400).json({ message: 'No notes found' })
    }

    const notesWithName = await Promise.all(notes.map(async (note) => {
        const name = await Name.findById(note.name).lean().exec()
        return { ...note, name: name.name }
    }))

    res.json(notesWithName)
}

// @desc Create new note
// @route POST /notes
// @access Private
const createNewNote = async (req, res) => {
    const { name, title, text } = req.body

    // Verification
    if (!name || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const unique = await Note.findOne({ title }).collation({locale: 'en', strength: 2}).lean().exec()

    if (unique) {
        return res.status(409).json({ message: 'Note title exists' })
    }

    const note = await Note.create({ name, title, text })

    if (note) { 
        return res.status(201).json({ message: 'New note created' })
    } else {
        return res.status(400).json({ message: 'Invalid note data received' })
    }
}

// @desc Update a note
// @route PATCH /notes
// @access Private
const updateNote = async (req, res) => {
    const { id, name, title, text } = req.body

    // Verification
    if (!id || !name || !title || !text) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const unique = await Note.findOne({ title }).collation({locale: 'en', strength: 2}).lean().exec()

    if (unique && unique?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.name = name
    note.title = title
    note.text = text

    const updatedNote = await note.save()

    res.json(`'${updatedNote.title}' updated`)
}

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = async (req, res) => {
    const { id } = req.body

    // Verification
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
}

module.exports = {
    getAllNotes,
    createNewNote,
    updateNote,
    deleteNote
}