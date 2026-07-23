import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import {
  getPublicProperties,
  getPropertyById,
  getDashboardProperties,
  createProperty,
  updateProperty,
  deleteProperty,
  approveProperty,
} from '../controllers/propertyController.js';
import { uploadSingle } from '../middlewares/upload.js';

const router = express.Router();

router.get('/', getPublicProperties);
router.get('/dashboard/all', authenticateToken, requireRole(['agent', 'admin']), getDashboardProperties);
router.get('/:id', getPropertyById);
router.post('/', authenticateToken, requireRole(['agent', 'admin']), uploadSingle, createProperty);
router.put('/:id', authenticateToken, requireRole(['agent', 'admin']), uploadSingle, updateProperty);
router.delete('/:id', authenticateToken, requireRole(['agent', 'admin']), deleteProperty);
router.patch('/:id/approve', authenticateToken, requireRole(['admin']), approveProperty);

export default router;
