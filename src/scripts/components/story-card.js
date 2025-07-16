import { saveStory, deleteStory, getStoryById } from '../idb.js';

export default class StoryCard {
  constructor(story) {
    this.story = story;
  }

  #formatDate(dateString) {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  }

  async render() {
    const { id, name, description, photoUrl, createdAt } = this.story;

    // Cek apakah story sudah disimpan di IndexedDB
    const isFavorite = await getStoryById(id);
    const icon = isFavorite ? '❤️' : '🤍';

    const article = document.createElement('article');
    article.className = 'story-card';
    article.setAttribute('data-story-id', id);
    article.setAttribute('aria-label', 'Sebuah container kartu');

    article.innerHTML = `
      <div class="story-image-container" aria-label="Gambar story si ${name}">
        <img 
          src="${photoUrl}" 
          alt="story ${name}" 
          class="story-image"
          loading="lazy"
          style="view-transition-name: story-image-${id}"
        >
      </div>
      <div class="story-content" aria-label="Informasi tambahan story si ${name}">
        <h3 class="story-title" style="view-transition-name: story-title-${id}" aria-label="Nama pembuat story">${name}</h3>
        <p class="story-description" aria-label="Deskripsi story">${description}</p>
        <time datetime="${createdAt}" class="story-date" aria-label="Tanggal dibuat story">
          ${this.#formatDate(createdAt)}
        </time>
        <button class="favorite-btn" aria-label="Tombol simpan atau hapus dari favorit">${icon}</button>
      </div>
    `;

    // Tambahkan event listener ke tombol favorite
    const favoriteButton = article.querySelector('.favorite-btn');
    favoriteButton.addEventListener('click', async () => {
      const currentStatus = await getStoryById(id);
      if (currentStatus) {
        await deleteStory(id);
        favoriteButton.textContent = '🤍';
      } else {
        await saveStory(this.story);
        favoriteButton.textContent = '❤️';
      }
    });

    return article;
  }
}
