import { getActivePathname, resolveRoute } from '../routes/url-parser';
import { clearAuthData, isLoggedIn } from '../utils/auth';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #currentPage = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    // Redirect default ke homepage jika hash kosong
    if (
      window.location.hash === '#/' ||
      window.location.hash === '' ||
      window.location.hash === '/#'
    ) {
      window.location.hash = '#/homepage';
    }

    this._setupDrawer();
    // renderPage dipanggil dari index.js, bukan di sini
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      const path = event.composedPath();
      const isClickInsideDrawer = path.some((el) => el === this.#navigationDrawer);
      const isClickOnButton = path.some((el) => el === this.#drawerButton);

      if (!isClickInsideDrawer && !isClickOnButton) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _updateNavigation() {
    const authLinks = isLoggedIn()
      ? `
        <li><a href="#/homepage" aria-label="Tombol ke Homepage">Homepage</a></li>
        <li><a href="#/map" aria-label="Tombol ke Map Page">Map</a></li>
        <li><a href="#/add-story" aria-label="Tombol ke Add Story Page">Add Story</a></li>
        <li><button id="logoutBtn" aria-label="Tombol Log Out">Logout</button></li>
      `
      : `
        <li><a href="#/login" aria-label="Tombol ke Login Page">Login</a></li>
        <li><a href="#/register" aria-label="Tombol ke Register Page">Register</a></li>
      `;

    const navList = this.#navigationDrawer.querySelector('.nav-list');
    navList.innerHTML = authLinks;

    const logoutBtn = this.#navigationDrawer.querySelector('#logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        clearAuthData();
        window.location.hash = '#/login';
        console.log('🚪 Logout sukses!');
      });
    }
  }

  async renderPage() {
    const routeInfo = resolveRoute();

    this._updateNavigation();

    if (routeInfo.redirect) {
      window.location.hash = routeInfo.redirect;
      return;
    }

    // Destroy halaman sebelumnya jika ada
    if (this.#currentPage && typeof this.#currentPage.destroy === 'function') {
      try {
        this.#currentPage.destroy();
      } catch (error) {
        console.error('❌ Error saat destroy sebelumnya:', error);
      }
    }

    this.#currentPage = null;

    if (routeInfo.component) {
      this.#currentPage = routeInfo.component;

      if (this.#content) {
        try {
          // 🔥 FIX UTAMA: render langsung ke this.#content, bukan cari .page-container
          this.#content.innerHTML = await this.#currentPage.render();
          await this.#currentPage.afterRender();
          document.title = routeInfo.title || 'App';
        } catch (error) {
          console.error('❌ Error saat renderPage:', error);
          this.#content.innerHTML = '<p class="error-message">Terjadi kesalahan saat memuat halaman.</p>';
        }
      }
    } else {
      if (this.#content) {
        this.#content.innerHTML = '<p class="error-message">❌ Page not found</p>';
        document.title = 'Not Found';
      }
      this.#currentPage = null;
    }
  }
}

export default App;
