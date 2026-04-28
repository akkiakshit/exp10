const API = 'http://localhost:3000';

// ─── AUTH HELPERS ───────────────────────────
function getUser() {
  return JSON.parse(localStorage.getItem('user'));
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function logout() {
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// ─── TAB SWITCHING ───────────────────────────
function showTab(tab) {
  document.getElementById('login-form').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'block' : 'none';
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (tab === 'login' && i === 0) || (tab === 'signup' && i === 1));
  });
}

// ─── LOGIN ───────────────────────────────────
async function login() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();
  if (!username || !password) return;
  const res = await fetch(`${API}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('login-error').textContent = data.error;
    return;
  }
  saveUser(data);
  window.location.href = '/welcome.html';
}

// ─── SIGNUP ──────────────────────────────────
async function signup() {
  const username = document.getElementById('signup-username').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  if (!username || !password) return;
  const res = await fetch(`${API}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) {
    document.getElementById('signup-error').textContent = data.error;
    return;
  }
  saveUser(data);
  window.location.href = '/welcome.html';
}

// ─── WELCOME PAGE ────────────────────────────
function goToTodos() {
  window.location.href = '/todo.html';
}

if (document.getElementById('welcome-username')) {
  const user = getUser();
  if (!user) { window.location.href = '/index.html'; }
  else { document.getElementById('welcome-username').textContent = user.username; }
}

// ─── TODO PAGE ───────────────────────────────
async function loadTodos() {
  const user = getUser();
  if (!user) return;
  const res = await fetch(`${API}/todos/${user.userId}`);
  const todos = await res.json();
  const list = document.getElementById('todoList');
  if (!list) return;
  list.innerHTML = '';
  document.getElementById('total-count').textContent = `${todos.length} todos`;
  document.getElementById('done-count').textContent = `${todos.filter(t => t.done).length} done`;
  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = todo.done ? 'done' : '';
    li.innerHTML = `
      <span>${todo.text}</span>
      <div class="actions">
        <button class="done-btn" onclick="toggleTodo(${todo.id})">✔</button>
        <button class="del-btn" onclick="deleteTodo(${todo.id})">✖</button>
      </div>
    `;
    list.appendChild(li);
  });
}

async function addTodo() {
  const user = getUser();
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (!text) return;
  await fetch(`${API}/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, userId: user.userId })
  });
  input.value = '';
  loadTodos();
}

async function toggleTodo(id) {
  await fetch(`${API}/todos/${id}`, { method: 'PUT' });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`${API}/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

if (document.getElementById('todo-username')) {
  const user = getUser();
  if (!user) { window.location.href = '/index.html'; }
  else {
    document.getElementById('todo-username').textContent = `👤 ${user.username}`;
    loadTodos();
  }
}