const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    sharedWith: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String,
        trim: true
    }]
}, {
    timestamps: true
});

// Create text indexes for search functionality
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Add a method to check if a user has access to this note
noteSchema.methods.hasAccess = function(userId) {
    return this.owner.equals(userId) || 
           this.sharedWith.some(sharedId => sharedId.equals(userId));
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
