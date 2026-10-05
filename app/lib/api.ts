import axios from 'axios';

// Get the Flask API URL from environment variables, fallback to local Flask port
const FLASK_API_URL = process.env.NEXT_PUBLIC_FLASK_API_URL || 'http://127.0.0.1:5000';

export const api = axios.create({
    baseURL: FLASK_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});