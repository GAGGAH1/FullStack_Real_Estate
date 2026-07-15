import express from 'express';
import { getContacts, getContact, createContact } from '../controllers/contactController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', protect, createContact);
router.get('/', protect, getContacts);
router.get('/:id', protect, getContact);

export default router;