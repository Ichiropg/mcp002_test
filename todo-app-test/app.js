// TODO App - Chrome DevTools MCP Test
class TodoApp {
  constructor() {
    this.todos = this.loadTodos();
    this.initElements();
    this.bindEvents();
    this.render();
  }

  initElements() {
    this.todoInput = document.getElementById('todoInput');
    this.addBtn = document.getElementById('addBtn');
    this.todoList = document.getElementById('todoList');
    this.totalCount = document.getElementById('totalCount');
    this.completedCount = document.getElementById('completedCount');
    this.pendingCount = document.getElementById('pendingCount');
    this.clearCompletedBtn = document.getElementById('clearCompleted');
    this.clearAllBtn = document.getElementById('clearAll');
  }

  bindEvents() {
    this.addBtn.addEventListener('click', () => this.addTodo());
    this.todoInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.addTodo();
    });
    this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
    this.clearAllBtn.addEventListener('click', () => this.clearAll());
  }

  addTodo() {
    const text = this.todoInput.value.trim();
    if (!text) {
      this.todoInput.focus();
      return;
    }

    const todo = {
      id: Date.now(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.todos.unshift(todo);
    this.todoInput.value = '';
    this.saveTodos();
    this.render();
    this.todoInput.focus();
  }

  toggleTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) {
      todo.completed = !todo.completed;
      this.saveTodos();
      this.render();
    }
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.saveTodos();
    this.render();
  }

  editTodo(id) {
    const todo = this.todos.find(t => t.id === id);
    if (!todo) return;

    const newText = prompt('タスクを編集:', todo.text);
    if (newText !== null && newText.trim()) {
      todo.text = newText.trim();
      this.saveTodos();
      this.render();
    }
  }

  clearCompleted() {
    const count = this.todos.filter(t => t.completed).length;
    if (count === 0) {
      alert('完了済みのタスクがありません');
      return;
    }
    if (confirm(`${count}件の完了済みタスクを削除しますか？`)) {
      this.todos = this.todos.filter(t => !t.completed);
      this.saveTodos();
      this.render();
    }
  }

  clearAll() {
    if (this.todos.length === 0) {
      alert('削除するタスクがありません');
      return;
    }
    if (confirm(`全${this.todos.length}件のタスクを削除しますか？`)) {
      this.todos = [];
      this.saveTodos();
      this.render();
    }
  }

  render() {
    if (this.todos.length === 0) {
      this.todoList.innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
          </svg>
          <p>タスクがありません</p>
          <p>上の入力欄から追加してください</p>
        </div>
      `;
    } else {
      this.todoList.innerHTML = this.todos.map(todo => `
        <li class="todo-item ${todo.completed ? 'completed' : ''}" data-id="${todo.id}">
          <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
          <span class="todo-text">${this.escapeHtml(todo.text)}</span>
          <div class="todo-actions">
            <button class="edit-btn">編集</button>
            <button class="delete-btn">削除</button>
          </div>
        </li>
      `).join('');

      // イベントを再バインド
      this.todoList.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
          const id = parseInt(e.target.closest('.todo-item').dataset.id);
          this.toggleTodo(id);
        });
      });

      this.todoList.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.closest('.todo-item').dataset.id);
          this.editTodo(id);
        });
      });

      this.todoList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = parseInt(e.target.closest('.todo-item').dataset.id);
          this.deleteTodo(id);
        });
      });
    }

    this.updateStats();
  }

  updateStats() {
    const total = this.todos.length;
    const completed = this.todos.filter(t => t.completed).length;
    const pending = total - completed;

    this.totalCount.textContent = `全件: ${total}`;
    this.completedCount.textContent = `完了: ${completed}`;
    this.pendingCount.textContent = `未完了: ${pending}`;
  }

  saveTodos() {
    localStorage.setItem('todos', JSON.stringify(this.todos));
  }

  loadTodos() {
    const saved = localStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// アプリを初期化
document.addEventListener('DOMContentLoaded', () => {
  new TodoApp();
});
