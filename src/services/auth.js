import { User } from '../db/models/userModel.js';
import { Session } from '../db/models/sessionModel.js';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { HttpError } from '../utils/HttpError.js';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';

export const register = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw HttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, password: hashedPassword });
  return newUser;
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw HttpError(404, 'User not found');

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) throw HttpError(401, 'Invalid credentials');

  await Session.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return { user, accessToken, refreshToken };
};

export const refreshSession = async (refreshToken) => {
  const existingSession = await Session.findOne({ refreshToken });
  if (!existingSession) throw HttpError(401, 'Invalid refresh token');

  await Session.deleteOne({ _id: existingSession._id });

  const user = await User.findById(existingSession.userId);
  if (!user) throw HttpError(404, 'User not found');

  const newAccessToken = randomBytes(30).toString('base64');
  const newRefreshToken = randomBytes(30).toString('base64');

  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });

  return {
    user,
    accessToken: newAccessToken,
    newRefreshToken,
  };
};

export const logout = async (refreshToken) => {
  const deletedSession = await Session.findOneAndDelete({ refreshToken });
  if (!deletedSession) {
    throw HttpError(401, 'Invalid refresh token');
  }
};