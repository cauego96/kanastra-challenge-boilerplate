import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Altere para o URL base da sua API
});

export const handleAxiosError = (error: unknown): Error => {
    if (axios.isAxiosError(error)) {
      return new Error(error.response?.data?.error || 'Error uploading file');
    } else {
      return new Error('An unexpected error occurred');
    }
  };

export default api;