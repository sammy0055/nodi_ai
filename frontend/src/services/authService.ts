import { API_ROUTES } from './apiClient';

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
}
