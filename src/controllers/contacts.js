import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import mongoose from 'mongoose';

export const getAllContacts = async (req, res, _next) => {
  const contacts = await contactsService.getAllContacts();
  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

export const getContactById = async (req, res, next) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(404, 'Contact not found'));
  }
  const contact = await contactsService.getContactById(contactId);
  if (!contact) {
    const error = createError(404, 'Contact not found');
    return next(error);
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res, _next) => {
  const contactData = req.body;

  const { name, phoneNumber, contactType } = contactData;

  if (!name || !phoneNumber || !contactType) {
    throw createError(400, 'Missing required fields');
  }

  const newContact = await contactsService.createContact(contactData);

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res, next) => {
  const { contactId } = req.params;
  const updateData = req.body;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(404, 'Contact not found'));
  }

  try {
    const updatedContact = await contactsService.updateContact(contactId, updateData);

    if (!updatedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });

  } catch {
    return next(createError(404, 'Contact not found'));
  }
};

export const deleteContact = async (req, res, next) => {
  const { contactId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    return next(createError(404, 'Contact not found'));
  }

  try {
    const deletedContact = await contactsService.deleteContact(contactId);

    if (!deletedContact) {
      return next(createError(404, 'Contact not found'));
    }

    res.status(204).send();
  } catch {
    return next(createError(404, 'Contact not found'));
  }
};