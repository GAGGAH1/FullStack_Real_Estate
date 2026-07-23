import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import authRoutes from './src/routes/authRoutes.js';
import propertyRoutes from './src/routes/propertyRoutes.js';
import inquiryRoutes from './src/routes/inquiryRoutes.js';
import userRoutes from './src/routes/userRoutes.js';


  const app = express();
  const PORT = 5000;

  app.use(cors());
  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  


  // API Router bindings
  app.use('/api/auth', authRoutes);
  app.use('/api/properties', propertyRoutes);
  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/users', userRoutes);

  
  const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();



