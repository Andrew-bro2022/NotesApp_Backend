const User = require('../models/user.model');

const signup = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'User with this email or username already exists' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();
        const token = user.generateAuthToken();

        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error creating user',
            error: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        // Verify password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid login credentials' });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.json({
            message: 'Logged in successfully',
            user,
            token
        });
    } catch (error) {
        res.status(400).json({
            message: 'Error logging in',
            error: error.message
        });
    }
};

module.exports = {
    signup,
    login
};
