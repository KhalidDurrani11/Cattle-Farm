const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data as T;
}

function authHeaders(token: string): HeadersInit {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
}

// Auth
export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<{ token: string; user: any }>(res);
}

export async function registerUser(data: {
  name: string; email: string; phone?: string; password: string;
  role?: string; location?: string; cnic?: string;
  tehsil?: string; district?: string; province?: string;
}) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse<{ token: string; user: any }>(res);
}

export async function getMe(token: string) {
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function updateProfile(data: object, token: string) {
  const res = await fetch(`${API_BASE}/api/auth/profile`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function changePassword(currentPassword: string, newPassword: string, token: string) {
  const res = await fetch(`${API_BASE}/api/auth/change-password`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse(res);
}

export async function submitVerificationDocuments(documents: { type: string; url: string }[], token: string) {
  const res = await fetch(`${API_BASE}/api/auth/verification`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ documents }),
  });
  return handleResponse(res);
}

// Cattle
export async function getCattle(params?: Record<string, string>) {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  const res = await fetch(`${API_BASE}/api/cattle${query}`, { next: { revalidate: 60 } });
  return handleResponse<{ data: any[]; pagination: any }>(res);
}

export async function getFeaturedCattle() {
  const res = await fetch(`${API_BASE}/api/cattle/featured`, { next: { revalidate: 300 } });
  return handleResponse<any[]>(res);
}

export async function getCattleById(id: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${id}`, { next: { revalidate: 60 } });
  return handleResponse(res);
}

export async function getMyListings(token: string, status?: string) {
  const query = status ? `?status=${status}` : '';
  const res = await fetch(`${API_BASE}/api/cattle/my-listings${query}`, {
    headers: authHeaders(token),
  });
  return handleResponse<any[]>(res);
}

export async function getCattleStats(token: string) {
  const res = await fetch(`${API_BASE}/api/cattle/stats`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function createCattle(data: object, token: string) {
  const res = await fetch(`${API_BASE}/api/cattle`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function updateCattle(id: string, data: object, token: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${id}`, {
    method: 'PUT', headers: authHeaders(token), body: JSON.stringify(data),
  });
  return handleResponse(res);
}

export async function deleteCattle(id: string, token: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${id}`, {
    method: 'DELETE', headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function markCattleAsSold(id: string, soldPrice: number, token: string, buyerId?: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${id}/mark-sold`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ soldPrice, buyerId }),
  });
  return handleResponse(res);
}

export async function markCattleAsAvailable(id: string, token: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${id}/mark-available`, {
    method: 'POST', headers: authHeaders(token),
  });
  return handleResponse(res);
}

// Cattle Verification
export async function submitCattleVerification(cattleId: string, data: { vaccinationRecords: any[]; healthNotes?: string }, token: string) {
  const res = await fetch(`${API_BASE}/api/cattle/${cattleId}/verification`, {
    method: 'POST', headers: authHeaders(token), body: JSON.stringify(data),
  });
  return handleResponse(res);
}

// Users
export async function getDashboard(token: string) {
  const res = await fetch(`${API_BASE}/api/users/dashboard`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getSellerProfile(id: string) {
  const res = await fetch(`${API_BASE}/api/users/${id}/profile`);
  return handleResponse(res);
}

export async function getFavorites(token: string) {
  const res = await fetch(`${API_BASE}/api/users/favorites`, {
    headers: authHeaders(token),
  });
  return handleResponse<any[]>(res);
}

export async function toggleFavorite(cattleId: string, token: string) {
  const res = await fetch(`${API_BASE}/api/users/favorites/${cattleId}`, {
    method: 'POST', headers: authHeaders(token),
  });
  return handleResponse<{ isFavorite: boolean; message: string; favorites: string[] }>(res);
}

// Inquiries
export async function createInquiry(cattleId: string, message: string, token: string) {
  const res = await fetch(`${API_BASE}/api/users/inquiries`, {
    method: 'POST', headers: authHeaders(token),
    body: JSON.stringify({ cattleId, message }),
  });
  return handleResponse(res);
}

export async function getInquiries(token: string) {
  const res = await fetch(`${API_BASE}/api/users/inquiries`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function respondToInquiry(inquiryId: string, response: string, token: string) {
  const res = await fetch(`${API_BASE}/api/users/inquiries/${inquiryId}/respond`, {
    method: 'PUT', headers: authHeaders(token),
    body: JSON.stringify({ response }),
  });
  return handleResponse(res);
}

// Notifications
export async function getNotifications(token: string) {
  const res = await fetch(`${API_BASE}/api/users/notifications`, {
    headers: authHeaders(token),
  });
  return handleResponse<any[]>(res);
}

export async function markNotificationAsRead(id: string, token: string) {
  const res = await fetch(`${API_BASE}/api/users/notifications/${id}/read`, {
    method: 'PUT', headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function markAllNotificationsAsRead(token: string) {
  const res = await fetch(`${API_BASE}/api/users/notifications/read-all`, {
    method: 'PUT', headers: authHeaders(token),
  });
  return handleResponse(res);
}

// Upload
export async function uploadImage(file: File, token: string): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('image', file);
  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData,
  });
  return handleResponse(res);
}

// Admin
export async function getAdminStats(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/stats`, {
    headers: authHeaders(token),
  });
  return handleResponse(res);
}

export async function getPendingUserVerifications(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/pending-verifications`, {
    headers: authHeaders(token),
  });
  return handleResponse<any[]>(res);
}

export async function verifyUser(userId: string, documentType: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/verify`, {
    method: 'PUT', headers: authHeaders(token),
    body: JSON.stringify({ documentType }),
  });
  return handleResponse(res);
}

export async function rejectUser(userId: string, reason: string, documentType: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/reject`, {
    method: 'PUT', headers: authHeaders(token),
    body: JSON.stringify({ reason, documentType }),
  });
  return handleResponse(res);
}

export async function getPendingCattleVerifications(token: string) {
  const res = await fetch(`${API_BASE}/api/admin/pending-cattle-verifications`, {
    headers: authHeaders(token),
  });
  return handleResponse<any[]>(res);
}

export async function verifyCattle(cattleId: string, healthScore: number, notes: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cattle/${cattleId}/verify`, {
    method: 'PUT', headers: authHeaders(token),
    body: JSON.stringify({ healthScore, notes }),
  });
  return handleResponse(res);
}

export async function rejectCattle(cattleId: string, reason: string, token: string) {
  const res = await fetch(`${API_BASE}/api/admin/cattle/${cattleId}/reject`, {
    method: 'PUT', headers: authHeaders(token),
    body: JSON.stringify({ reason }),
  });
  return handleResponse(res);
}
