import * as authService from '../services/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { HttpError } from '../utils/HttpError.js';
import { Session } from '../db/models/sessionModel.js';

export const register = ctrlWrapper(async (req, res) => {
  const user = await authService.register(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  });
});

export const login = ctrlWrapper(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);

   res
    .cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({
      status: 200,
      message: 'Successfully logged in!',
      data: {
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      },
    });
});

export const refresh = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw HttpError(401, "No refresh token");
  }
 const session = await Session.findOne({ refreshToken });
  if (!session) {
    throw HttpError(403, "Invalid session");
  }

  const { accessToken, newRefreshToken } = await authService.refreshSession(refreshToken);

  res
    .cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
    })
    .status(200)
    .json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: { accessToken },
    });
});

export const logout = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    return res.status(401).json({ status: 401, message: 'Refresh token missing' });
  }

  await authService.logout(refreshToken);

  res.status(204).send();
});