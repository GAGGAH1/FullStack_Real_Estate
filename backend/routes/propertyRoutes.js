import express from 'express';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
} from '../controllers/propertyController.js';

import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.post('/create', protect, authorize('agent', 'admin'), createProperty);
router.get('/all_properties', getProperties)
router.get('/:id', getProperty)
router.put('/update/:id', protect, authorize('agent', 'admin'), updateProperty)
router.delete('/delete/:id/', protect, authorize('agent', 'admin'), deleteProperty);

export default router;