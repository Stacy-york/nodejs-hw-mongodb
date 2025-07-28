import express from 'express';
import cors from 'cors';
import pino from 'pino';
import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import { errorHandler } from './middlewares/errorHandler.js';
import cookieParser from 'cookie-parser';

const logger = pino();

export const setupServer = () => {
  const app = express();

  app.use(cookieParser());
  app.use(cors());
  app.use(express.json());
  app.get('/', (req, res) => {
  res.json({ message: 'Server is up and running!' });
  });

  app.use('/contacts', contactsRouter);
  app.use('/auth', authRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`);
  });
};