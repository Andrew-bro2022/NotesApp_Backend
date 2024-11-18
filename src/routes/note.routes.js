const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth.middleware');
const {
    getNotes,
    getNoteById,
    createNote,
    updateNote,
    deleteNote,
    shareNote,
    searchNotes
} = require('../controllers/note.controller');

// Protect all note routes with authentication middleware
router.use(auth);

// Get all notes
router.get('/', getNotes);

// Search notes
router.get('/search', searchNotes);

// Get specific note
router.get('/:id', getNoteById);

// Create new note
router.post('/', createNote);

// Update note
router.put('/:id', updateNote);

// Delete note
router.delete('/:id', deleteNote);

// Share note
router.post('/:id/share', shareNote);

module.exports = router;
