import StoryModel from '../../data/story-api';

export default class HomePresenter {
  #model;
  #view;
  #storiesData;
  #storiesArray = [];

  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
  }

  async init() {
    try {
      // Loading ditampilkan oleh view sebelum pemanggilan init
      await this.getAllStories();
      this.#prepareStoriesArray();
      await this.#view.showStories(this.#storiesArray);
      this.#view.attachStoryCardListeners(this.#storiesArray);
    } catch (error) {
      this.#view.showError('Terjadi kesalahan saat memuat data.');
      this.#view.showConsoleError?.('Error during initialization:', error);
    }
  }

  async getAllStories() {
    try {
      const stories = await this.#model.getAllStories();
      this.#storiesData = stories?.listStory || [];
      return this.#storiesData;
    } catch (error) {
      this.#view.showError('Gagal memuat cerita!');
      this.#view.showConsoleError?.('Error fetching stories:', error);
      return [];
    }
  }

  #prepareStoriesArray() {
    if (Array.isArray(this.#storiesData)) {
      this.#storiesArray = this.#storiesData;
    } else if (this.#storiesData && typeof this.#storiesData === 'object') {
      if (
        this.#storiesData.listStory &&
        Array.isArray(this.#storiesData.listStory)
      ) {
        this.#storiesArray = this.#storiesData.listStory;
      } else if (Object.values(this.#storiesData).some(Array.isArray)) {
        for (const key in this.#storiesData) {
          if (Array.isArray(this.#storiesData[key])) {
            this.#storiesArray = this.#storiesData[key];
            break;
          }
        }
      } else {
        this.#storiesArray = Object.values(this.#storiesData).filter(
          (item) => item && typeof item === 'object'
        );
      }
    } else {
      this.#storiesArray = [];
      this.#view.showConsoleError?.(
        'Data stories bukan array atau object:',
        this.#storiesData
      );
    }
  }
}
