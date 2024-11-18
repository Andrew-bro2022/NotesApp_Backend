const Note = require('../models/note.model');
const User = require('../models/user.model');

// Get all notes for authenticated user
const getNotes = async (req, res) => {
    try {
        const notes = await Note.find({
            $or: [
                { owner: req.user._id },
                { sharedWith: req.user._id }
            ]
        }).sort({ updatedAt: -1 });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a specific note by ID
const getNoteById = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (!note.hasAccess(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new note
const createNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        
        const note = new Note({
            title,
            content,
            tags,
            owner: req.user._id
        });

        await note.save();
        res.status(201).json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update a note
const updateNote = async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        note.title = title || note.title;
        note.content = content || note.content;
        note.tags = tags || note.tags;

        await note.save();
        res.json(note);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a note
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        await note.remove();
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Share a note with another user
const shareNote = async (req, res) => {
    try {
        const { username } = req.body;
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (!note.owner.equals(req.user._id)) {
            return res.status(403).json({ message: 'Access denied' });
        }

        const userToShare = await User.findOne({ username });
        if (!userToShare) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (note.sharedWith.includes(userToShare._id)) {
            return res.status(400).json({ message: 'Note already shared with this user' });
        }

        note.sharedWith.push(userToShare._id);
        await note.save();

        res.json({ message: 'Note shared successfully', note });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search notes
const searchNotes = async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        const notes = await Note.find({
            $and: [
                { $text: { $search: q } },
                {
                    $or: [
                        { owner: req.user._id },
                        { sharedWith: req.user._id }
                    ]
                }
            ]
        }).sort({ score: { $meta: 'textScore' } });

        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    shareNote,
    searchNotes
};
