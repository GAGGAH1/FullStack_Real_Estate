import userModel from'../models/userModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Request body is empty. Make sure to send JSON with Content-Type: application/json'
    });
  }

  const { name, email, password, role } = req.body;

  try {
    const userExists = await userModel.findOne({ email });

    if(userExists) return res.status(400).json({
      success: false, 
      message: 'User already exists' 
    });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: user,
      token: token
    });


  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Server error/Registration failed', 
      error: error.message 
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userData = await userModel.findOne({ email });

    if(!userData) return res.status(404).json({
            success: false,
            message: 'Invalid Credentials( User not Found)',
       });
    const isPasswordTheSame = await bcrypt.compare(password, userData.password);
      if(!isPasswordTheSame) return res.status(401).json({
        success: false,
        message: 'Password not Matching'
      })
      const token = generateToken(userData._id);

      res.status(200).json({ 
            success: true,
            message: 'Login successfully',
            token: token,
            data: userData
      });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error/Login error', 
      error: error.message 
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
export const logout = (req, res) => {
  // Since we are using JWT stored on client, we don't have a session to destroy.
  // We can just send a success message and the client will remove the token.
  res.json({ message: 'Logged out successfully' });
};