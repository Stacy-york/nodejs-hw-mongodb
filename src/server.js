import express from 'express';
import cors from 'cors';
import pino from 'pino';
import { getAllContacts } from './services/contacts.js';
import { getContactById } from './services/contacts.js';

const logger = pino();

export const setupServer = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/', (req, res) => {
    logger.info('GET / - тестовий запит');
    res.send('API is working! 🚀');
  });
    
  app.get('/contacts', async (req, res) => {
    try {
      const contacts = await getAllContacts();
      res.status(200).json({
        status: 200,
        message: 'Successfully found contacts!',
        data: contacts,
      });
    } catch (error) {
      logger.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
    
    app.get('/contacts/:contactId', async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await getContactById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

  app.use((req, res) => {
    logger.warn(`404 Not Found - ${req.originalUrl}`);
    res.status(404).json({ message: 'Not found' });
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    logger.info(`✅ Server is running on port ${PORT}`);
  });
};