import express from 'express';
import { errorLogger } from '../helpers/logger';
import { validateSignUpSchema } from '../middleware/validation/sign-up';
import { UserController } from '../controllers/user.controller';
import { APIResponseFormat } from '../types/apiTypes';
import { authMiddleware } from '../middleware/authentication';
import { setAuthHeaderCookie } from '../helpers/set-auth-header';
import { UserService } from '../services/users.service';

const userRoute = express.Router();

userRoute.post('/create-user', authMiddleware, validateSignUpSchema(), async (req, res) => {
  try {
    const data = await UserController.createUser(req.body, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'user created successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/delete-user', authMiddleware, async (req, res) => {
  try {
    await UserController.deleteUser(req.body.userId, req.user!);
    const response: APIResponseFormat<any> = {
      message: 'user deleted successfully',
      data: null,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/sign-up', validateSignUpSchema(), async (req, res) => {
  try {
    const data = await UserController.signUp(req.body);
    const response: APIResponseFormat<any> = {
      message: 'user created successfully',
      data,
    };

    setAuthHeaderCookie(res, data.tokens, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.get('/sign-up-with-google', async (req, res) => {
  try {
    const data = await UserController.signUpWithGoogle();
    const response: APIResponseFormat<any> = {
      message: 'google auth url created successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.get('/sign-in-with-google', async (req, res) => {
  try {
    const data = await UserController.signInWithGoogle();
    const response: APIResponseFormat<any> = {
      message: 'google auth url created successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/exchange-google-auth-code-signup', async (req, res) => {
  try {
    const data = await UserController.exchangeGoogleAuthCodeForSignUp(req.body.code);
    const response: APIResponseFormat<any> = {
      message: 'google auth is successfully',
      data,
    };

    setAuthHeaderCookie(res, data.tokens, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/exchange-google-auth-code-signin', async (req, res) => {
  try {
    const data = await UserController.exchangeGoogleAuthCodeForSignIn(req.body.code);
    const response: APIResponseFormat<any> = {
      message: 'google auth is successfully',
      data,
    };

    setAuthHeaderCookie(res, data.tokens, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/login', async (req, res) => {
  try {
    const data = await UserController.login(req.body);
    const response: APIResponseFormat<any> = {
      message: 'login successfully',
      data,
    };

    setAuthHeaderCookie(res, data.tokens, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/logout', (req, res) => {
  try {
    res.clearCookie('auth_tokens', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });

    res.status(200).json({
      message: 'logout successfully',
    });
  } catch (error: any) {
    errorLogger(error);
    res.status(500).json({
      message: error.message,
    });
  }
});

userRoute.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    const data = await UserController.refreshToken(refreshToken);
    const response: APIResponseFormat<any> = {
      message: 'token refreshed successfully',
      data,
    };

    setAuthHeaderCookie(res, data, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/create-reset-password-link', async (req, res) => {
  try {
    await UserService.createResetPasswordLink(req.body.email);
    const response: APIResponseFormat<any> = {
      message: `password reset link sent to ${req.body.email}`,
      data: [],
    };

    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.post('/reset-password', async (req, res) => {
  try {
    const token = req.body.token;
    const newPassword = req.body.newPassword;
    const data = await UserService.resetPassword(token, newPassword);
    const response: APIResponseFormat<any> = {
      message: 'password reset successfully',
      data,
    };

    setAuthHeaderCookie(res, data.tokens, 'auth_tokens');
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

userRoute.get('/current-user', authMiddleware, async (req: any, res) => {
  try {
    const data = await UserController.getCurrentUser(req.user);
    const response: APIResponseFormat<any> = {
      message: 'user retrieved successfully',
      data,
    };
    res.status(201).json(response);
  } catch (error: any) {
    const response: APIResponseFormat<null> = {
      message: error.message,
      error: error,
    };
    errorLogger(error);
    res.status(500).json(response);
  }
});

export { userRoute };
