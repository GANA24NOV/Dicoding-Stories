import LoginPresenter from './login-presenter.js';

export default class LoginPage {
  #presenter;
  #loadingIndicator = null;
  #globalLoadingOverlay = null;

 async render() {
  return `
    <section class="container view-transition-content" tabindex="0">
      <div id="globalLoadingOverlay" class="global-loading-overlay">
        <div class="loading-spinner"></div>
        <div class="loading-text">Proses Login...</div>
      </div>

      <div class="container-flex">
        <form class="container-flex-form" id="formLogin">
          <h1>Login Page</h1>
          <p>Silahkan masukkan email dan password untuk masuk ke dalam web</p>

          <div class="form-group">
            <label for="email-input">Email</label>
            <input
              type="email"
              id="email-input"
              name="email"
              autocomplete="email"
              placeholder="email@gmail.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password-input">Password</label>
            <input
              type="password"
              id="password-input"
              name="password"
              autocomplete="current-password"
              placeholder="password"
              required
            />
          </div>

          <p class="error-message" id="loginError" hidden></p>

          <button class="confirm-button">Login</button>

          <p>Belum punya akun? silahkan <a href="#/register">register disini</a></p>
        </form>
      </div>
    </section>
  `;
}


  async afterRender() {
    await new Promise((resolve) => setTimeout(resolve, 50));
    this.#loadingIndicator = document.querySelector('.loading-spinner');
    this.#globalLoadingOverlay = document.getElementById('globalLoadingOverlay');
    this.#presenter = new LoginPresenter({ view: this });

    const formLogin = document.getElementById('formLogin');
    this.hideLoading();

    if (formLogin) {
      formLogin.addEventListener('submit', async (e) => {
        e.preventDefault();

        this.hideLoginError();

        const email = document.getElementById('email-input').value;
        const password = document.getElementById('password-input').value;
        const userData = { email, password };

        this.showLoading();
        await this.#presenter.loginUser(userData);
      });
    }
  }

  showLoginError(message) {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
      errorElement.hidden = false;
      errorElement.textContent = message;
    } else {
      console.log('Error dengan id loginError tidak ditemukan');
    }

    this.hideLoading();
  }

  hideLoginError() {
    const errorElement = document.getElementById('loginError');
    if (errorElement) {
      errorElement.hidden = true;
      errorElement.textContent = '';
    }
  }

  showLoading() {
    if (this.#globalLoadingOverlay) {
      this.#globalLoadingOverlay.style.display = 'flex';
    }

    if (this.#loadingIndicator) {
      this.#loadingIndicator.style.display = 'block';
    }
  }

  hideLoading() {
    if (this.#globalLoadingOverlay) {
      this.#globalLoadingOverlay.style.display = 'none';
    }

    if (this.#loadingIndicator) {
      this.#loadingIndicator.style.display = 'none';
    }
  }

  navigateToHomepage() {
    this.hideLoading();
    window.location.hash = '#/homepage';
  }
}
