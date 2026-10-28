const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth token
const getAuthHeader = () => {
  const token = sessionStorage.getItem('phroneo_admin_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Programs API
export const fetchPrograms = async () => {
  const response = await fetch(`${API_URL}/programs`);
  if (!response.ok) throw new Error('Failed to fetch programs');
  return response.json();
};

export const createProgram = async (program) => {
  const response = await fetch(`${API_URL}/programs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(program)
  });
  if (!response.ok) throw new Error('Failed to create program');
  return response.json();
};

export const updateProgram = async (slug, program) => {
  const response = await fetch(`${API_URL}/programs/${slug}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(program)
  });
  if (!response.ok) throw new Error('Failed to update program');
  return response.json();
};

export const deleteProgram = async (slug) => {
  const response = await fetch(`${API_URL}/programs/${slug}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete program');
  return response.json();
};

// Submissions API
export const createSubmission = async (submission) => {
  const response = await fetch(`${API_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  if (!response.ok) throw new Error('Failed to create submission');
  return response.json();
};

export const fetchSubmissions = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value));
  });
  const response = await fetch(`${API_URL}/submissions?${params}`, {
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to fetch submissions');
  return response.json();
};

export const updateSubmissionStatus = async (id, status) => {
  const response = await fetch(`${API_URL}/submissions/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ status })
  });
  if (!response.ok) throw new Error('Failed to update submission');
  return response.json();
};

export const deleteSubmission = async (id) => {
  const response = await fetch(`${API_URL}/submissions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete submission');
  return response.json();
};

export const clearSubmissions = async () => {
  const response = await fetch(`${API_URL}/submissions`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to clear submissions');
  return response.json();
};

// Auth and administrator management API
export const fetchAdmins = async () => {
  const response = await fetch(`${API_URL}/auth/admins`, { headers: getAuthHeader() });
  if (!response.ok) throw new Error('Failed to fetch admin accounts');
  return response.json();
};

export const createAdmin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/admins`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create admin account');
  }
  return response.json();
};

export const deleteAdmin = async (id) => {
  const response = await fetch(`${API_URL}/auth/admins/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to remove admin account');
  }
  return response.json();
};

export const loginAdmin = async (email, password) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) throw new Error('Failed to login');
  const data = await response.json();
  sessionStorage.setItem('phroneo_admin_token', data.token);
  return data;
};

export const verifyToken = async () => {
  const token = sessionStorage.getItem('phroneo_admin_token');
  if (!token) return null;

  const response = await fetch(`${API_URL}/auth/verify`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    sessionStorage.removeItem('phroneo_admin_token');
    return null;
  }
  return response.json();
};

export const logoutAdmin = () => {
  sessionStorage.removeItem('phroneo_admin_token');
};
