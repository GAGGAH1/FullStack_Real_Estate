import express from 'express';
import { authenticateToken } from '../middlewares/auth.js';
import { registerUser, loginUser, getProfile, toggleDemoRole } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', authenticateToken, getProfile);
router.post('/demo/toggle-my-role', authenticateToken, toggleDemoRole);

export default router;
