import { UserService } from '../services/users.service';
import { ISignUp, User } from '../types/users';

export class UserController {
  static async signUp(data: Omit<ISignUp, 'id'>) {
    return await UserService.signUp(data);
  }
  static async signUpWithGoogle() {
    return await UserService.authenticateWithGoogle();
  }
    static async signInWithGoogle() {
    return await UserService.authenticateWithGoogle();
  }
  static async exchangeGoogleAuthCodeForSignUp(code: string) {
    return await UserService.exchangeGoogleSignUpCode(code);
  }
  static async exchangeGoogleAuthCodeForSignIn(code: string) {
    return await UserService.exchangeGoogleSignInCode(code);
  }
  static async login(data: Pick<ISignUp, 'email' | 'password' | 'authType'>) {
    return await UserService.login(data);
  }
  static async refreshToken(refreshToken: string) {
    return await UserService.refreshToken(refreshToken);
  }
  static async getCurrentUser(user: User) {
    return await UserService.getCurrentUser(user);
  }
}
