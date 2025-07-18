import StoryModel from '../../data/story-api';

export default class AddStoryPresenter {
  #view;
  #model;
  #mediaStream;
  #capturedPhoto;
  #geoLocation;
  #videoElement;

  constructor({ view }) {
    this.#model = StoryModel;
    this.#view = view;
    this.#mediaStream = null;
    this.#capturedPhoto = null;
    this.#geoLocation = null;
    this.#videoElement = null;
  }

  setVideoElement(element) {
    this.#videoElement = element;
  }

  async initializeCamera() {
    try {
      this.#mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });

      if (!this.#videoElement) {
        this.#view.showCameraError('Elemen video tidak ditemukan.');
        return;
      }

      this.#videoElement.srcObject = this.#mediaStream;
      this.#videoElement.addEventListener('loadedmetadata', () => {
        this.#videoElement.play().catch((error) => {
          this.#view.showConsoleError?.('Video play interrupted:', error);
        });
      });
    } catch (error) {
      this.#view.showCameraError('Akses kamera ditolak!');
      this.#stopMediaStream();
    }
  }

  capturePhoto() {
    if (!this.#mediaStream) return;
    return this.#view.captureCameraFrame();
  }

  #stopMediaStream() {
    if (this.#mediaStream) {
      this.#mediaStream.getTracks().forEach((track) => {
        track.stop();
        track.enabled = false;
      });
      this.#mediaStream = null;
    }

    if (this.#videoElement) {
      this.#videoElement.srcObject = null;
    }
  }

  handleFileInput(file) {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.#capturedPhoto = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async handleLocation(isChecked) {
    if (isChecked) {
      try {
        this.#geoLocation = await this.#getCurrentLocation();
        this.#view.setLocationStatus(true);
      } catch (error) {
        this.#view.showLocationError('GAGAL MENDAPATKAN LOKASI');
        this.#view.setLocationStatus(false);
      }
    } else {
      this.#geoLocation = null;
      this.#view.setLocationStatus(false);
    }
  }

  async #getCurrentLocation() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 5000,
      });
    });
  }

  /**
   * Method baru untuk menerima input dari map manual
   */
  setManualLocation(lat, lon) {
    this.#geoLocation = {
      coords: {
        latitude: lat,
        longitude: lon,
      },
    };
    this.#view.setLocationStatus(true);
  }

  async submitStory(formData) {
    const description = formData.get('description');
    const photoFile = formData.get('photo');

    if (!description || !photoFile) {
      this.#view.showSubmitError('Deskripsi dan foto wajib diisi!');
      return;
    }

    const submitFormData = new FormData();
    submitFormData.append('description', description);
    submitFormData.append('photo', photoFile);

    if (this.#geoLocation) {
      submitFormData.append('lat', this.#geoLocation.coords.latitude);
      submitFormData.append('lon', this.#geoLocation.coords.longitude);
    }

    try {
      const response = await StoryModel.postNewStory(submitFormData);
      if (response.error) {
        this.#view.showSubmitError('Yah Gagal mengunggah cerita.');
      } else {
        this.#view.showStoryAddedMessage();
        this.#stopMediaStream();
        this.#view.navigateToHomepage();
      }
    } catch (error) {
      this.#view.showSubmitError('Gagal mengunggah cerita. Coba lagi yukk.');
      this.#view.showConsoleError?.('Submission error:', error);
    }
  }

  destroy() {
    this.#stopMediaStream();
  }
}
