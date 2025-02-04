const API_BASE = 'http://localhost:3000';
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const todoForm = document.getElementById('todo-form');
const todoList = document.getElementById('todo-list');

function getAuthToken() {
    return document.cookie.split('; ').find(row => row.startsWith('authToken='))?.split('=')[1];
}

function setAuthToken(token) {
    document.cookie = `authToken=${token}; path=/`;
}

function removeAuthToken() {
    document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/';
}

async function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Registration successful. You can now log in.');
    } else {
        alert(data.error);
    }
}

async function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    if (response.ok) {
        setAuthToken(data.token);
        showTodoSection();
        loadTodos();
    } else {
        alert(data.error);
    }
}

function showTodoSection() {
    document.getElementById('auth-section').classList.add('hidden');
    document.getElementById('todo-section').classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
}

async function loadTodos() {
    const token = getAuthToken();
    if (!token) return;

    const response = await fetch(`${API_BASE}/todos`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    const todos = await response.json();
    todoList.innerHTML = '';
    todos.forEach(todo => {
        const li = document.createElement('li');
        li.innerHTML = `
            <input type="checkbox" ${todo.completed ? 'checked' : ''} data-id="${todo.id}">
            <span class="${todo.completed ? 'completed' : ''}"><strong>${todo.title}</strong> - ${todo.description}</span>
            <button data-id="${todo.id}">X</button>
        `;
        todoList.appendChild(li);
    });
}

async function addTodo(event) {
    event.preventDefault();
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-desc').value;
    const token = getAuthToken();

    await fetch(`${API_BASE}/todos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ title, description })
    });

    loadTodos();
}

async function logout() {
    const token = getAuthToken();
    if (!token) return;

    await fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    removeAuthToken();
    location.reload();
}

todoList.addEventListener('change', async (event) => {
    if (event.target.type === 'checkbox') {
        const token = getAuthToken();
        const id = event.target.dataset.id;
        const completed = event.target.checked;

        await fetch(`${API_BASE}/todos/${event.target.dataset.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ completed: event.target.checked })
        });
        event.target.nextElementSibling.classList.toggle('completed', completed);
    }
});

todoList.addEventListener('click', async (event) => {
    if (event.target.tagName === 'BUTTON') {
        const token = getAuthToken();
        await fetch(`${API_BASE}/todos/${event.target.dataset.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        loadTodos();
    }
});

registerForm.addEventListener('submit', register);
loginForm.addEventListener('submit', login);
todoForm.addEventListener('submit', addTodo);
logoutBtn.addEventListener('click', logout);

if (getAuthToken()) {
    showTodoSection();
    loadTodos();
}