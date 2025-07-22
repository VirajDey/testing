const { Router } = require('itty-router');

const { SUPABASE_URL, SUPABASE_ANON_KEY } = globalThis;
const SUPABASE_TABLE = 'users';

const router = Router();

// Helper to call Supabase REST API
async function supabaseRequest(method, path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
  const options = {
    method,
    headers,
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, data };
}

// Create user
router.post('/users', async (request) => {
  const { name, email, phone } = await request.json();
  const { status, data } = await supabaseRequest('POST', SUPABASE_TABLE, [{ name, email, phone }]);
  return new Response(JSON.stringify(data[0]), { status });
});

// Get all users
router.get('/users', async () => {
  const { status, data } = await supabaseRequest('GET', `${SUPABASE_TABLE}?select=*`);
  return new Response(JSON.stringify(data), { status });
});

// Get user by ID
router.get('/users/:id', async ({ params }) => {
  const { id } = params;
  const { status, data } = await supabaseRequest('GET', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(data[0]), { status });
});

// Update user
router.put('/users/:id', async (request) => {
  const { id } = request.params;
  const { name, email, phone } = await request.json();
  const { status, data } = await supabaseRequest('PATCH', `${SUPABASE_TABLE}?id=eq.${id}`, { name, email, phone });
  if (!data || !data.length) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(data[0]), { status });
});

// Delete user
router.delete('/users/:id', async ({ params }) => {
  const { id } = params;
  const { status, data } = await supabaseRequest('DELETE', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return new Response('Not found', { status: 404 });
  return new Response(JSON.stringify(data[0]), { status });
});

// 404 for everything else
router.all('*', () => new Response('Not found', { status: 404 }));

addEventListener('fetch', (event) => {
  event.respondWith(router.handle(event.request));
}); 