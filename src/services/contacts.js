import { Contact } from '../db/models/contactModel.js';

export const getAllContacts = async ({ query = {}, skip = 0, limit = 10, sort = {} }) => {
  const contacts = await Contact.find(query).skip(skip).limit(limit).sort(sort);
  return contacts;
};

export const getContactById = async (contactId) => {
  return await Contact.findById(contactId);
};

export const createContact = async (contactData) => {
  const contact = await Contact.create(contactData);
  return contact;
};

export const updateContact = async (contactId, updateData) => {
  return await Contact.findByIdAndUpdate(contactId, updateData, {
    new: true,
    runValidators: true,
  });
};

export const deleteContact = async (contactId) => {
  return await Contact.findByIdAndDelete(contactId);
};

export const countContacts = async (query = {}) => {
  return Contact.countDocuments(query);
};