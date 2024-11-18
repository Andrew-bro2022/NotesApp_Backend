const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    sharedNotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note'
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});

// Generate JWT token
userSchema.methods.generateAuthToken = function() {
    return jwt.sign(
        { _id: this._id.toString() },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// Compare password
userSchema.methods.comparePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

// Remove password and other sensitive info when converting to JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
