import { Hono } from 'hono';

const { SUPABASE_URL, SUPABASE_ANON_KEY } = globalThis;
const SUPABASE_TABLE = 'users';

const app = new Hono();

// Debug route to check env vars
app.get('/env', (c) => c.json({
  SUPABASE_URL,
  SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'set' : 'not set'
}));

async function supabaseRequest(method, path, body) {
  const url = `${SUPABASE_URL}/rest/v1/${path}`;
  console.log('Supabase URL:', url); // Debug log
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation',
  };
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json();
  return { status: res.status, data };
}

// Root route
app.get('/', (c) => c.text('API is running'));

// Create user
app.post('/users', async (c) => {
  try {
    const { name, email, phone } = await c.req.json();
    const { status, data } = await supabaseRequest('POST', SUPABASE_TABLE, [{ name, email, phone }]);
    return c.json(data[0], status);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Get all users
app.get('/users', async (c) => {
  const { status, data } = await supabaseRequest('GET', `${SUPABASE_TABLE}?select=*`);
  return c.json(data, status);
});

// Get user by ID
app.get('/users/:id', async (c) => {
  const { id } = c.req.param();
  const { status, data } = await supabaseRequest('GET', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
  return c.json(data[0], status);
});

// Update user
app.put('/users/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const { name, email, phone } = await c.req.json();
    const { status, data } = await supabaseRequest('PATCH', `${SUPABASE_TABLE}?id=eq.${id}`, { name, email, phone });
    if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
    return c.json(data[0], status);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete user
app.delete('/users/:id', async (c) => {
  const { id } = c.req.param();
  const { status, data } = await supabaseRequest('DELETE', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
  return c.json(data[0], status);
});

// 404 for everything else
app.all('*', (c) => c.json({ error: 'Not found' }, 404));

export default app; 