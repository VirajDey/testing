import { Hono } from 'hono';
import { cors } from 'hono/cors';



const SUPABASE_TABLE = 'users';

const app = new Hono();

// Enable CORS for all routes
app.use('*', cors());

// Debug route to check env vars
app.get('/env', (c) => c.json({
  SUPABASE_URL: c.env?.SUPABASE_URL,
  SUPABASE_ANON_KEY: c.env?.SUPABASE_ANON_KEY ? 'set' : 'not set'
}));

async function supabaseRequest(env, method, path, body) {
  const url = `${env.SUPABASE_URL}/rest/v1/${path}`;
  console.log('Supabase URL:', url); // Debug log
  const headers = {
    'apikey': env.SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
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
    const { status, data } = await supabaseRequest(c.env, 'POST', SUPABASE_TABLE, [{ name, email, phone }]);
    return c.json(data[0], status);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Get all users
app.get('/users', async (c) => {
  const { status, data } = await supabaseRequest(c.env, 'GET', `${SUPABASE_TABLE}?select=*`);
  return c.json(data, status);
});

// Get user by ID
app.get('/users/:id', async (c) => {
  const { id } = c.req.param();
  const { status, data } = await supabaseRequest(c.env, 'GET', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
  return c.json(data[0], status);
});

// Update user
app.put('/users/:id', async (c) => {
  try {
    const { id } = c.req.param();
    const { name, email, phone } = await c.req.json();
    const { status, data } = await supabaseRequest(c.env, 'PATCH', `${SUPABASE_TABLE}?id=eq.${id}`, { name, email, phone });
    if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
    return c.json(data[0], status);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Delete user
app.delete('/users/:id', async (c) => {
  const { id } = c.req.param();
  const { status, data } = await supabaseRequest(c.env, 'DELETE', `${SUPABASE_TABLE}?id=eq.${id}`);
  if (!data || !data.length) return c.json({ error: 'Not found' }, 404);
  return c.json(data[0], status);
});

// Serve OpenAPI YAML
app.get('/openapi.yaml', (c) =>
  c.text(
    `openapi: 3.0.0
info:
  title: Users API
  version: 1.0.0
servers:
  - url: http://localhost:8787
  - url: https://test-backend.viraj-frisson.workers.dev
paths:
  /users:
    get:
      summary: List all users
      responses:
        '200':
          description: A list of users
    post:
      summary: Create a user
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '201':
          description: User created
  /users/{id}:
    get:
      summary: Get a user by ID
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
        '404':
          description: Not found
    put:
      summary: Update a user
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'
      responses:
        '200':
          description: User updated
        '404':
          description: Not found
    delete:
      summary: Delete a user
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User deleted
        '404':
          description: Not found
components:
  schemas:
    User:
      type: object
      properties:
        name:
          type: string
        email:
          type: string
        phone:
          type: string
`,
    200,
    { 'Content-Type': 'text/yaml' }
  )
);

// Serve Swagger UI
app.get('/docs', (c) =>
  c.html(`<!DOCTYPE html>
<html>
  <head>
    <title>Swagger UI</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
    <script>
      window.onload = () => {
        SwaggerUIBundle({
          url: '/openapi.yaml',
          dom_id: '#swagger-ui'
        });
      };
    </script>
  </body>
</html>`)
);

// 404 for everything else
app.all('*', (c) => c.json({ error: 'Not found' }, 404));

export default app; 