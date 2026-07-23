import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';

const router = express.Router();

router.get('/', authenticateToken, requireRole(['admin']), getUsers);
router.put('/:id/role', authenticateToken, requireRole(['admin']), updateUserRole);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);

export default router;
