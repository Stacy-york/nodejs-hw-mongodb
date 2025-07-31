import express from 'express';
import * as authController from '../controllers/auth.js';
import { validateBody } from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/usersSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { sendResetEmailSchema } from '../schemas/sendResetEmailSchema.js';
import { resetPasswordSchema } from '../schemas/resetPwdSchema.js';

const router = express.Router();

router.post('/register', validateBody(registerSchema), ctrlWrapper(authController.register));
router.post('/login', validateBody(loginSchema), ctrlWrapper(authController.login));
router.post('/refresh', ctrlWrapper(authController.refresh)); 
router.post('/logout', ctrlWrapper(authController.logout));
router.post('/send-reset-email', validateBody(sendResetEmailSchema), ctrlWrapper(authController.sendResetEmail));
router.post('/reset-pwd', validateBody(resetPasswordSchema), ctrlWrapper(authController.resetPasswordController));

export default router;