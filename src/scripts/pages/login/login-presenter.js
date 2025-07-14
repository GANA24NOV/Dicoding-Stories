import AuthModel from '../../data/auth-api';
import { setAuthData } from '../../utils/auth';

export default class LoginPresenter {
  #model;
  #view;

  constructor({ view }) {
    this.#model = AuthModel;
    this.#view = view;
  }

  async loginUser(userData) {
    try {
      const response = await this.#model.loginUser(userData);

      if (response.error) {
        const message = response.message || 'Email atau password salah!';
        this.#view.showLoginError(message);
        return;
      }

      const loginResult = response.loginResult;
      setAuthData({ token: loginResult.token });

      console.log('LOGIN BERHASIL!');
      this.#view.navigateToHomepage();
    } catch (error) {
      console.error(error);
      this.#view.showLoginError('Terjadi kesalahan jaringan. Coba lagi nanti.');
    }
  }
}
