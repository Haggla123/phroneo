const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

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

// Team Members API
export const fetchTeamMembers = async () => {
  const response = await fetch(`${API_URL}/team`);
  if (!response.ok) throw new Error('Failed to fetch team members');
  return response.json();
};

export const createTeamMember = async (member) => {
  const response = await fetch(`${API_URL}/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(member)
  });
  if (!response.ok) throw new Error('Failed to create team member');
  return response.json();
};

export const updateTeamMember = async (id, member) => {
  const response = await fetch(`${API_URL}/team/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(member)
  });
  if (!response.ok) throw new Error('Failed to update team member');
  return response.json();
};

export const deleteTeamMember = async (id) => {
  const response = await fetch(`${API_URL}/team/${id}`, {
    method: 'DELETE',
    headers: getAuthHeader()
  });
  if (!response.ok) throw new Error('Failed to delete team member');
  return response.json();
};

// Submissions API
export const createSubmission = async (submission) => {
  const response = await fetch(`${API_URL}/submissions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to create submission');
  }
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

export const fetchContactDeliverySettings = async () => {
  const response = await fetch(`${API_URL}/settings/contact-delivery`, { headers: getAuthHeader() });
  if (!response.ok) throw new Error('Failed to load contact delivery settings');
  return response.json();
};

export const saveContactDeliverySettings = async (recipientEmail) => {
  const response = await fetch(`${API_URL}/settings/contact-delivery`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify({ recipientEmail })
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Failed to save contact delivery settings');
  }
  return response.json();
};

export const sendContactDeliveryTest = async () => {
  const response = await fetch(`${API_URL}/settings/contact-delivery/test`, {
    method: 'POST',
    headers: getAuthHeader()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to send test email');
  return data;
};

export const fetchLegalPages = async () => {
  const response = await fetch(`${API_URL}/settings/legal-pages`);
  if (!response.ok) throw new Error('Failed to load legal pages');
  return response.json();
};

export const fetchAdminLegalPages = async () => {
  const response = await fetch(`${API_URL}/settings/legal-pages`, { headers: getAuthHeader() });
  if (!response.ok) throw new Error('Failed to load legal pages');
  return response.json();
};

export const saveLegalPages = async (legalPages) => {
  const response = await fetch(`${API_URL}/settings/legal-pages`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(legalPages)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to save legal pages');
  return data;
};

export const fetchStories = async () => {
  const response = await fetch(`${API_URL}/stories`);
  if (!response.ok) throw new Error('Failed to load stories');
  return response.json();
};

export const fetchAdminStories = async () => {
  const response = await fetch(`${API_URL}/stories/admin`, { headers: getAuthHeader() });
  if (!response.ok) throw new Error('Failed to load stories');
  return response.json();
};

export const createStory = async (story) => {
  const response = await fetch(`${API_URL}/stories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(story)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to create story');
  return data;
};

export const updateStory = async (id, story) => {
  const response = await fetch(`${API_URL}/stories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(story)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to update story');
  return data;
};

export const deleteStory = async (id) => {
  const response = await fetch(`${API_URL}/stories/${id}`, { method: 'DELETE', headers: getAuthHeader() });
  if (!response.ok) throw new Error('Failed to delete story');
  return response.json();
};

export const resendContactEmail = async (id) => {
  const response = await fetch(`${API_URL}/submissions/${id}/resend-email`, {
    method: 'POST',
    headers: getAuthHeader()
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Failed to resend contact email');
  return data;
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
  let response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
  } catch {
    throw new Error('API_UNAVAILABLE');
  }
  if (!response.ok) {
    if (response.status === 401) throw new Error('INVALID_CREDENTIALS');
    throw new Error('LOGIN_FAILED');
  }
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
