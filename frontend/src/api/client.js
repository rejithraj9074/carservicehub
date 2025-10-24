import { logout } from '../utils/auth';

// Use environment variable or default to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

console.log('API Base URL:', API_BASE_URL); // For debugging

// Helper function to get the appropriate token
function getAuthToken() {
  // Check for adminToken first (from AdminLogin)
  const adminToken = localStorage.getItem('adminToken');
  if (adminToken) {
    return adminToken;
  }
  
  // Fall back to regular token (from general Login)
  return localStorage.getItem('token');
}

// Helper function to handle authentication errors
function handleAuthError(status) {
  if (status === 401 || status === 403) {
    // Clear auth tokens and redirect to login
    logout();
  }
}

// Public POST request (no authentication)
export async function postJsonPublic(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function postMultipart(path, formData) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` })
    },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const details = Array.isArray(data?.errors)
      ? data.errors.map((e) => `${e.path || e.param || 'field'}: ${e.msg || e.message}`).join('; ')
      : (typeof data?.error === 'string' ? data.error : undefined);
    const message = details
      ? `${data?.message || 'Request failed'} - ${details}`
      : (typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function putMultipart(path, formData) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: {
      ...(token && { "Authorization": `Bearer ${token}` })
    },
    body: formData,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const details = Array.isArray(data?.errors)
      ? data.errors.map((e) => `${e.path || e.param || 'field'}: ${e.msg || e.message}`).join('; ')
      : (typeof data?.error === 'string' ? data.error : undefined);
    const message = details
      ? `${data?.message || 'Request failed'} - ${details}`
      : (typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`);
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function getJson(path) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "GET",
    headers: { 
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const message = typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function deleteJson(path) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const message = typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function postJson(path, body) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const message = typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function putJson(path, body) {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      ...(token && { "Authorization": `Bearer ${token}` })
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    handleAuthError(response.status);
    const message = typeof data?.error === 'string' ? data.error : data?.message || `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

const apiClient = { postJson, postJsonPublic, putJson, getJson, deleteJson, postMultipart, putMultipart };

export default apiClient;