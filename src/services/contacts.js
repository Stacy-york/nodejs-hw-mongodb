import { Contact } from '../db/models/contactModel.js';

export const getAllContacts = async ({ userId, query = {}, skip = 0, limit = 10, sort = {} }) => {
  return await Contact.find({ ...query, userId }).skip(skip).limit(limit).sort(sort);
};

export const getContactById = async (contactId, userId) => {
  return await Contact.findOne({ _id: contactId, userId });
};

export const createContact = async (contactData, userId) => {
  return await Contact.create({ ...contactData, userId });
};

export const updateContact = async (contactId, updateData, userId) => {
  return await Contact.findOneAndUpdate({ _id: contactId, userId }, updateData, { new: true, runValidators: true });
};

export const deleteContact = async (contactId, userId) => {
  return await Contact.findOneAndDelete({ _id: contactId, userId });
};

export const countContacts = async (query = {}) => {
  return Contact.countDocuments(query);
};