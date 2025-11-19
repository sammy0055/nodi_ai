import { API_ROUTES, ApiClient } from './apiClient';

export class AuthService {
  constructor() {}

  async login(email: string, password: string) {
    const res = await fetch(API_ROUTES.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    const data = (await res.json()) as { data: any; errors: any };

    if (!res.ok) throw data;

    return data;
  }

  async signUp({ email, password, name }: { email: string; password: string; name: string }) {
    const res = await fetch(API_ROUTES.SIGNUP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ name, email, password }),
    });

    const data = (await res.json()) as { data: any; errors: any };
    if (!res.ok) throw data;
    return data;
  }

  async signupWithGoogle(code: string) {
    await ApiClient('SIGNUP_WITH_GOOGLE', {
      method: 'POST',
      body: { code },
    });
  }

  async signinWithGoogle(code: string) {
    await ApiClient('SIGNIN_WITH_GOOGLE', {
      method: 'POST',
      body: { code },
    });
  }

  async createPasswordResetLink(email: string) {
    await ApiClient('CREATE_PASSWORD_RESET_LINK', { method: 'POST', body: { email } });
  }

  async resetPassword(token: string, password: string) {
    await ApiClient('RESET_PASSWORD', { method: 'POST', body: { token, newPassword: password } });
  }
}
