import express from 'express';
import { authenticateToken, requireRole } from '../middlewares/auth.js';
import { createInquiry, getInquiries, replyToInquiry } from '../controllers/inquiryController.js';

const router = express.Router();

router.post('/', authenticateToken, createInquiry);
router.get('/', authenticateToken, getInquiries);
router.post('/:id/reply', authenticateToken, requireRole(['agent', 'admin']), replyToInquiry);

export default router;
