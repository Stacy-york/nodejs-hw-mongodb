import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().allow(null),
  phoneNumber: Joi.string().min(10).max(20).required(),
  isFavourite: Joi.boolean().default(false),
  contactType: Joi.string().valid('home', 'work', 'personal').default('personal'),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  email: Joi.string().email().allow(null),
  phoneNumber: Joi.string().min(10).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string().valid('home', 'work', 'personal'),
}).min(1);