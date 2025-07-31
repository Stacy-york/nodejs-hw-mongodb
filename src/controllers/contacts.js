import { HttpError } from '../utils/HttpError.js';
import * as contactsService from '../services/contacts.js';
import mongoose from 'mongoose';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';

export const getAllContacts = async (req, res) => {
  const { page = 1, perPage = 10, sortBy = 'name', sortOrder = 'asc' } = req.query;

  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const totalItems = await contactsService.countContacts({ userId: req.user._id });
  const totalPages = Math.ceil(totalItems / perPage);

  const contacts = await contactsService.getAllContacts({
    userId: req.user._id,
    page,
    perPage,
    sort,
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
    throw HttpError(404, 'Contact not found');
  }

  const contact = await contactsService.getContactById(contactId, req.user._id);

  if (!contact) {
    throw HttpError(404, 'Contact not found');
  }

  res.json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContact = async (req, res) => {
  let photoUrl = '';

  if (req.file) {
    photoUrl = await saveFileToCloudinary(req.file);
  }

  const newContact = await contactsService.createContact(
    { ...req.body, photo: photoUrl },
    req.user._id
  );

  res.status(201).json({
    status: 201,
    message: 'Successfully created a contact!',
    data: newContact,
  });
};

export const updateContact = async (req, res) => {
  const { contactId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(contactId)) {
    throw HttpError(404, 'Contact not found');
  }

  let photoUrl;

  if (req.file) {
    photoUrl = await saveFileToCloudinary(req.file);
  }

  const updatedData = { ...req.body };
  if (photoUrl) {
    updatedData.photo = photoUrl;
  }

  const updatedContact = await contactsService.updateContact(contactId, updatedData, req.user._id);

  if (!updatedContact) {
    throw HttpError(404, 'Contact not found');
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
    throw HttpError(404, 'Contact not found');
  }

  const deletedContact = await contactsService.deleteContact(contactId, req.user._id);

  if (!deletedContact) {
    throw HttpError(404, 'Contact not found');
  }

  res.status(204).send();
};