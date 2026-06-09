const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const AUTH_TOKEN_KEY = 'fh_auth_token';

function getHeaders() {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const isLocalAdmin = localStorage.getItem('fh_local_admin_session') === 'true';
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...(isLocalAdmin && { 'X-Dev-Admin-Secret': process.env.REACT_APP_ADMIN_PASSWORD }),
  };
}

async function request(method, path, body = null) {
  const headers = getHeaders();
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${BASE_URL}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'API request failed');
  return data;
}

async function upload(path, formData) {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  const isLocalAdmin = localStorage.getItem('fh_local_admin_session') === 'true';
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(isLocalAdmin && { 'X-Dev-Admin-Secret': process.env.REACT_APP_ADMIN_PASSWORD }),
    },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data;
}

export const characterAPI = {
  getAll:        ()         => request('GET', '/characters'),
  getAllAdmin:    ()         => request('GET', '/characters?all=true'),
  getOne:        (id)       => request('GET', `/characters/${id}`),
  create:        (body)     => request('POST', '/characters', body),
  update:        (id, body) => request('PUT', `/characters/${id}`, body),
  delete:        (id)       => request('DELETE', `/characters/${id}`),
  togglePublish: (id)       => request('PATCH', `/characters/${id}/publish`),
};

export const authAPI = {
  register: (body) => request('POST', '/auth/register', body),
  login:    (body) => request('POST', '/auth/login', body),
  me:       ()     => request('GET', '/auth/me'),
  updateMe: (body) => request('PATCH', '/auth/me', body),
};

export const productAPI = {
  getAll:      ()         => request('GET', '/products'),
  getAllAdmin: ()         => request('GET', '/products?all=true'),
  getOne:      (id)       => request('GET', `/products/${id}`),
  create:      (body)     => request('POST', '/products', body),
  update:      (id, body) => request('PUT', `/products/${id}`, body),
  delete:      (id)       => request('DELETE', `/products/${id}`),
  updateStock: (id, qty)  => request('PATCH', `/products/${id}/stock`, { stock_qty: qty }),
};

export const orderAPI = {
  getMyOrders:  ()            => request('GET', '/orders/my'),
  getOne:       (id)          => request('GET', `/orders/${id}`),
  track:        (num)         => request('GET', `/orders/track/${num}`),
  trackByEmail: (email)       => request('GET', `/orders/email/${encodeURIComponent(email)}`),
  create:       (body)        => request('POST', '/orders', body),
  getAll:       (params = {}) => request('GET', `/orders?${new URLSearchParams(params)}`),
  updateStatus: (id, body)    => request('PATCH', `/orders/${id}/status`, body),
  addTracking:  (id, body)    => request('PATCH', `/orders/${id}/tracking`, body),
  refund:       (id)          => request('POST', `/orders/${id}/refund`),
};

export const paymentAPI = {
  createStripeSession: (body) => request('POST', '/payments/create-session', body),
};

export const uploadAPI = {
  uploadImage:      (file, folder = 'general') => { const fd = new FormData(); fd.append('file', file); fd.append('folder', folder); return upload('/upload/image', fd); },
  uploadModel:      (file, folder = 'characters') => { const fd = new FormData(); fd.append('file', file); fd.append('folder', folder); return upload('/upload/model', fd); },
  uploadStoryImage: (file) => { const fd = new FormData(); fd.append('file', file); return upload('/upload/story-image', fd); },
};

export const adminAPI = {
  getStats:     ()          => request('GET', '/admin/stats'),
  getRevenue:   (days = 30) => request('GET', `/admin/revenue?days=${days}`),
  getCustomers: ()          => request('GET', '/admin/customers'),
  getMessages:  ()          => request('GET', '/admin/messages'),
  markRead:     (id)        => request('PATCH', `/admin/messages/${id}/read`),
};

export const storyAPI = {
  getApproved: ()           => request('GET', '/stories'),
  submit:      (body)       => request('POST', '/stories', body),
  getPending:  ()           => request('GET', '/stories?status=pending'),
  approve:     (id)         => request('PATCH', `/stories/${id}/approve`),
  reject:      (id, notes)  => request('PATCH', `/stories/${id}/reject`, { admin_notes: notes }),
};

export const signatureItemAPI = {
  getByCharacter: (characterId) => request('GET', `/signature-items/${characterId}`),
  getOne:         (itemId)      => request('GET', `/signature-items/item/${itemId}`),
  getAdmin:       (characterId) => request('GET', `/signature-items/admin/${characterId}`),
  create:         (body)        => request('POST', '/signature-items', body),
  update:         (id, body)    => request('PUT', `/signature-items/${id}`, body),
  delete:         (id)          => request('DELETE', `/signature-items/${id}`),
  toggleActive:   (id)          => request('PATCH', `/signature-items/${id}/toggle`),
  updateStock:    (id, qty)     => request('PATCH', `/signature-items/${id}/stock`, { stock_qty: qty }),
  uploadImage:    (id, file)    => {
    const fd = new FormData();
    fd.append('file', file);
    return upload(`/signature-items/${id}/image`, fd);
  },
};

export const promotionAPI = {
  getActive:     ()         => request('GET', '/promotions'),
  getFeatured:   ()         => request('GET', '/promotions/featured/now'),
  getBySlug:     (slug)     => request('GET', `/promotions/${slug}`),
  validateCode:  (body)     => request('POST', '/promotions/validate-code', body),
  getAllAdmin:   ()         => request('GET', '/promotions/admin/all'),
  create:        (body)     => request('POST', '/promotions', body),
  update:        (id, body) => request('PUT', `/promotions/${id}`, body),
  toggle:        (id)       => request('PATCH', `/promotions/${id}/toggle`),
  delete:        (id)       => request('DELETE', `/promotions/${id}`),
  uploadBanner:  (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return upload(`/promotions/${id}/banner`, fd);
  },
  getItems:      (id)       => request('GET', `/promotions/${id}/items`),
  createItem:    (id, body) => request('POST', `/promotions/${id}/items`, body),
  updateItem:    (id, body) => request('PUT', `/promotions/items/${id}`, body),
  deleteItem:    (id)       => request('DELETE', `/promotions/items/${id}`),
  uploadItemImage: (id, file) => {
    const fd = new FormData();
    fd.append('file', file);
    return upload(`/promotions/items/${id}/image`, fd);
  },
};
