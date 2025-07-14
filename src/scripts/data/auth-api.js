import CONFIG from '../config';

const ENDPOINTS = {
  REGISTER: `${CONFIG.BASE_URL}/register`,
  LOGIN: `${CONFIG.BASE_URL}/login`,
};

const AuthModel = {
  async registerUser(userData) {
    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: true,
          message: result.message || 'Registrasi gagal.',
        };
      }

      return result;
    } catch (error) {
      return {
        error: true,
        message: 'Gagal melakukan koneksi ke server.',
      };
    }
  },

  async loginUser(userData) {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (!response.ok) {
        return {
          error: true,
          message: result.message || 'Login gagal.',
        };
      }

      return result;
    } catch (error) {
      return {
        error: true,
        message: 'Gagal melakukan koneksi ke server.',
      };
    }
  },
};

export default AuthModel;
