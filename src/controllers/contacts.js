import createError from 'http-errors';
import * as contactsService from '../services/contacts.js';
import mongoose from 'mongoose';

export const getAllContacts = async (req, res) => {
  const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const totalItems = await contactsService.countContacts();
  const totalPages = Math.ceil(totalItems / perPage);

   const contacts = await contactsService.getAllContacts({
    skip,
    limit: Number(perPage),
    sort
  });

  res.json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page: Number(page),
      perPage: Number(perPage),
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
};

export const getContactById = async (req, res) => {
  const { contactId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw (createError(404, 'Contact not found'));
  }
  const contact = await contactsService.getContactById(contactId);
  if (!contact) {
    throw createError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
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

export const updateContact = async (req, res) => {
  const { contactId } = req.params;
  const updateData = req.body;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(404, 'Contact not found');
  }

    const updatedContact = await contactsService.updateContact(contactId, updateData);

    if (!updatedContact) {
      throw createError(404, 'Contact not found');
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully patched a contact!',
      data: updatedContact,
    });
};

export const deleteContact = async (req, res) => {
  const { contactId } = req.params;
  
  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw createError(404, 'Contact not found');
  }

  const deletedContact = await contactsService.deleteContact(contactId);

  if (!deletedContact) {
    throw createError(404, 'Contact not found');
  }

  res.status(204).send();
};