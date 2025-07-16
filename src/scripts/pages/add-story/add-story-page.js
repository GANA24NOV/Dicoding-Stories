import AddStoryPresenter from './add-story-presenter';

export default class AddStoryPage {
  #presenter;
  #videoElement;
  #photoCanvasElement;
  #capturedCameraDataURL = null;

  constructor() {
    this.#presenter = new AddStoryPresenter({ view: this });
  }

  async render() {
    return `
      <section class="add-story view-transition-content">
        <div class="heading--container">
          <h1>📸 Cerita Baru</h1>
          <p>Ceritakan pengalamanmu dalam bentuk foto dan deskripsi kamu </p>
        </div>

        <form id="storyForm" class="story-form" method="POST" enctype="multipart/form-data">
          <div class="camera-preview">
            <video id="cameraView" class="camera-view" muted playsinline></video>
            <canvas id="photoCanvas" class="photo-canvas" hidden></canvas>
            <button type="button" id="captureBtn" aria-label="Ambil foto" class="capture-btn">
              <i class="fas fa-camera"></i>
            </button>
          </div>

          <div class="form-group">
            <label for="description">Deskripsi</label>
            <textarea 
              id="description" 
              name="description" 
              placeholder="Tuliskan pengalaman atau cerita di balik foto ini..."
              required
              maxlength="1000"
              rows="5"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="photoFile">Atau Unggah Foto</label>
            <input 
              type="file" 
              id="photoFile" 
              name="photo" 
              accept="image/*" 
              class="file-input"
            />
            <p id="fileNameDisplay" class="file-name-preview"></p>
          </div>

          <div class="form-group location-group">
            <label for="includeLocation" class="checkbox-label">
              <input type="checkbox" id="includeLocation" />
              Sertakan Lokasi Saat Ini
            </label>
          </div>

          <div id="map" style="height: 300px; margin-top: 16px;" aria-label="Peta untuk memilih lokasi cerita"></div>

          <button type="submit" class="confirm-button">💖 Publikasikan Cerita</button>
        </form>

        <div id="errorMessage" class="error-message" hidden aria-live="polite"></div>
        <div id="successMessage" class="success-message" hidden aria-live="polite">
          Cerita berhasil ditambahkan! 🎉
        </div>
      </section>
    `;
  }

  async afterRender() {
    this.#videoElement = document.getElementById('cameraView');
    this.#photoCanvasElement = document.getElementById('photoCanvas');

    this.#presenter.setVideoElement(this.#videoElement);

    document.getElementById('captureBtn').addEventListener('click', () => this.handleCaptureButtonClick());

    document.getElementById('photoFile').addEventListener('change', (e) => {
      this.#presenter.handleFileInput(e.target.files[0]);
      const fileName = e.target.files[0]?.name || '';
      document.getElementById('fileNameDisplay').textContent = fileName
        ? `📁 Foto terpilih: ${fileName}`
        : '';
    });

    document.getElementById('includeLocation').addEventListener('change', (e) =>
      this.#presenter.handleLocation(e.target.checked)
    );

    document.getElementById('storyForm').addEventListener('submit', (e) => this.handleSubmit(e));

    await this.#presenter.initializeCamera();

    const map = L.map('map').setView([-6.2, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    let marker;
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      if (marker) {
        marker.setLatLng([lat, lng]);
      } else {
        marker = L.marker([lat, lng]).addTo(map);
      }
      this.#presenter.setManualLocation(lat, lng);
    });
  }

  setCameraStream(stream) {
    this.#videoElement.srcObject = stream;
    this.#videoElement.addEventListener('loadedmetadata', () => {
      this.#videoElement.play().catch((error) => {
        console.log('Video play interrupted:', error);
      });
    });
  }

  captureCameraFrame() {
    const context = this.#photoCanvasElement.getContext('2d');
    const maxWidth = 640;
    const maxHeight = 480;
    let width = this.#videoElement.videoWidth;
    let height = this.#videoElement.videoHeight;

    if (width > maxWidth) {
      height *= maxWidth / width;
      width = maxWidth;
    }
    if (height > maxHeight) {
      width *= maxHeight / height;
      height = maxHeight;
    }

    this.#photoCanvasElement.width = width;
    this.#photoCanvasElement.height = height;
    context.drawImage(this.#videoElement, 0, 0, width, height);
    return this.#photoCanvasElement.toDataURL('image/jpeg', 0.8);
  }

  showCameraError(message) {
    document.getElementById('errorMessage').textContent = message;
  }

  showLocationError(message) {
    document.getElementById('errorMessage').textContent = message;
  }

  showSubmitError(message) {
    document.getElementById('errorMessage').hidden = false;
    document.getElementById('errorMessage').textContent = message;
  }

  showStoryAddedMessage() {
    const successMessageElement = document.getElementById('successMessage');
    if (successMessageElement) {
      successMessageElement.removeAttribute('hidden');
      setTimeout(() => {
        successMessageElement.setAttribute('hidden', true);
      }, 3000);
    } else {
      console.error("Elemen dengan ID 'successMessage' tidak ditemukan!");
    }
  }

  setLocationStatus(isIncluded) {
    const locationCheckbox = document.getElementById('includeLocation');
    locationCheckbox.checked = isIncluded;
  }

  async handleCaptureButtonClick() {
    const photoDataURL = this.#presenter.capturePhoto();
    if (photoDataURL) {
      this.#capturedCameraDataURL = photoDataURL;
      this.#videoElement.style.display = 'none';
      this.#photoCanvasElement.removeAttribute('hidden');
    }
  }

  async handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    let imageFile = formData.get('photo');

    if (this.#capturedCameraDataURL) {
      const blob = await fetch(this.#capturedCameraDataURL).then((r) => r.blob());
      const timestamp = new Date().getTime();
      const filename = `captured_${timestamp}.jpg`;
      imageFile = new File([blob], filename, { type: 'image/jpeg' });
      formData.set('photo', imageFile);
    }

    await this.#presenter.submitStory(formData);
  }

  navigateToHomepage() {
    window.dispatchEvent(new CustomEvent('story-added'));
    window.location.hash = '#/homepage';
  }

  destroy() {
    if (this.#presenter) {
      this.#presenter.destroy();
      console.log('AddStoryPage: Cleaning up camera resources');
    }
  }
}
