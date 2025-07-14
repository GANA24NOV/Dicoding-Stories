import AuthModel from '../../data/auth-api';

export default class RegisterPresenter {
  #model;
  #view;

  constructor({ view }) {
    this.#model = AuthModel;
    this.#view = view;
  }

  async registerUser(userData) {
    try {
      const response = await this.#model.registerUser(userData); // ← Tambah await

      if (response.error) {
        this.#view.showRegisterError(response.message);
      } else {
        console.log('REGISTER BERHASIL!');
        this.#view.navigateToLogin();
      }
    } catch (error) {
      console.error('Error di RegisterPresenter:', error);
      this.#view.showRegisterError('Terjadi kesalahan saat proses register.');
    }
  }
}
