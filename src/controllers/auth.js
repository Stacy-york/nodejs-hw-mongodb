import * as authService from '../services/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { HttpError } from '../utils/HttpError.js';
import { Session } from '../db/models/sessionModel.js';
import jwt from 'jsonwebtoken';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendEmail.js';
import { SMTP } from '../constants/index.js';
import { User } from '../db/models/userModel.js';

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

export const sendResetEmail = ctrlWrapper(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw HttpError(404, 'User not found');
  }

  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    getEnvVar('JWT_SECRET'),
    {
      expiresIn: '5m',
    }
  );

  const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password!</p>`,
  });

  res.status(200).json({
    status: 200,
    message: 'Reset email sent successfully!',
  });
});

export const resetPasswordController = async (req, res) => {
  await authService.resetPassword(req.body);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
};