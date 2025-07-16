import StoryCard from '../../components/story-card';
import HomePresenter from './home-presenter';
import LightboxManager from '../../components/lightbox-manager';

export default class HomePage {
  #presenter;
  #storiesContainer;
  #loadingIndicator = null;
  #globalLoadingOverlay = null;
  #lightboxManager;

  async render() {
  return `
    <section class="container view-transition-content homepage-section">
      <div id="globalLoadingOverlay" class="global-loading-overlay" aria-label="Loading content">
        <div class="loading-spinner"></div>
        <div class="loading-text">✨ Sedang memuat cerita-cerita terbaik...</div>
      </div>

      <div class="heading--container">
        <h1 class="pink-heading">📚 Kumpulan Cerita</h1>
        <p class="heading-desc">Temukan kisah dan pengalaman menarik dari pengguna lainnya!</p>
      </div>

      <div class="stories-container" aria-label="Container story pengguna">
        <div class="loading-indicator">💭 Tunggu sebentar ya, kami sedang mengambil cerita...</div>
      </div>
    </section>
  `;
}


  async afterRender() {
    this.#storiesContainer = document.querySelector('.stories-container');
    this.#loadingIndicator = document.querySelector('.loading-indicator');
    this.#globalLoadingOverlay = document.getElementById('globalLoadingOverlay');

    if (!this.#storiesContainer) {
      this.showConsoleError('DOM stories-container belum ada!');
      return;
    }

    this.showLoading(); // ⬅️ Tampilkan loading lebih awal

    this.#lightboxManager = new LightboxManager();
    this.#presenter = new HomePresenter({ view: this });

    try {
      await this.#presenter.init();
    } catch (error) {
      this.showError('GAGAL MEMUAT CERITA');
      this.showConsoleError('Error initializing HomePresenter:', error);
    } finally {
      this.hideLoading(); // ⬅️ Sembunyikan setelah semua proses selesai
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

  async showStories(stories) {
    if (!this.#storiesContainer) return;

    if (!stories || stories.length === 0) {
      this.#storiesContainer.innerHTML = '<p class="empty-message">💔 Belum ada cerita yang tersedia...</p>';
      return;
    }

    const renderedCards = await Promise.all(
      stories.map(async (story) => {
        const card = new StoryCard(story);
        return `<div class="story-animation">${await card.render()}</div>`;
      })
    );

    this.#storiesContainer.innerHTML = renderedCards.join('');
  }

  attachStoryCardListeners(stories) {
    const storyCards = document.querySelectorAll('.story-card');
    storyCards.forEach((card) => {
      card.addEventListener('click', (e) => {
        e.stopPropagation();
        const storyId = card.dataset.storyId;
        const story = stories.find((s) => s.id === storyId);
        if (story) {
          if (document.startViewTransition) {
            document.startViewTransition(() => {
              this.#lightboxManager.openLightbox(story);
            });
          } else {
            this.#lightboxManager.openLightbox(story);
          }
        }
      });
    });
  }

  showError(message) {
    this.hideLoading();
    const errorMessage = document.createElement('p');
    errorMessage.className = 'error-message';
    errorMessage.textContent = message;
    this.#storiesContainer.innerHTML = '';
    this.#storiesContainer.appendChild(errorMessage);
  }

  showConsoleError(message, error) {
    console.error(message, error);
  }
}
