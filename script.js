window.addEventListener('DOMContentLoaded', () => {
  const listScreen = document.getElementById('listScreen');
  const editorScreen = document.getElementById('editorScreen');
  const notesList = document.getElementById('notesList');
  const pinnedList = document.getElementById('pinnedList');
  const addBtn = document.getElementById('addNoteBtn');
  const backBtn = document.getElementById('backBtn');
  const doneBtn = document.getElementById('doneBtn');
  const deleteBtn = document.getElementById('deleteBtn');
  const selectAllBtn = document.getElementById('selectAllBtn');
  const noteTitleInput = document.getElementById('noteTitleInput');
  const noteBodyInput = document.getElementById('noteBodyInput');
  const searchInput = document.getElementById('searchInput');
  const sortSelect = document.getElementById('sortSelect') || { value: 'dateDesc' };
  const pinnedCount = document.getElementById('pinnedCount');
  const allCount = document.getElementById('allCount');
  const pinBtn = document.getElementById('pinBtn');

  let selectionMode = false;
  const selectedIds = new Set();
  let notes = JSON.parse(localStorage.getItem('notes') || '[]');
  let currentNote = null;

  const save = () => localStorage.setItem('notes', JSON.stringify(notes));

  const sortNotes = (arr, mode) => {
    const cmp = (a, b) => {
      if (mode === 'dateDesc') return b.id - a.id;
      if (mode === 'dateAsc') return a.id - b.id;
      if (mode === 'titleAsc') return a.title.localeCompare(b.title);
      if (mode === 'titleDesc') return b.title.localeCompare(a.title);
      return 0;
    };
    return arr.slice().sort(cmp);
  };

  const updateDeleteButtonText = () => {
    const delBtn = document.getElementById('deleteAllBtn');
    if (!delBtn) return;
    if (selectedIds.size === 0) delBtn.textContent = 'Удалить все';
    else if (selectedIds.size === notes.length) delBtn.textContent = 'Удалить все';
    else delBtn.textContent = 'Удалить';
  };

  const render = (filter = '') => {
    const mode = sortSelect.value || 'dateDesc';
    const filtered = notes.filter(n =>
      n.title.toLowerCase().includes(filter) ||
      n.body.toLowerCase().includes(filter)
    );
    const sorted = sortNotes(filtered, mode);
    notesList.innerHTML = '';
    pinnedList.innerHTML = '';
    sorted.forEach(n => {
      const li = document.createElement('li');
      li.className = 'note-item';
      if (selectionMode) {
        const checked = selectedIds.has(n.id) ? 'checked' : '';
        li.innerHTML = `
          <input type="checkbox" class="note-select" data-id="${n.id}" ${checked} style="margin-right:0.5rem;">
          <div>
            <h3>${n.title}</h3>
            <p>${n.body.substring(0, 60)}${n.body.length > 60 ? '...' : ''}</p>
          </div>`;
        const cb = li.querySelector('.note-select');
li.onclick = (e) => {
  if (e.target.closest('.note-select')) return;
  cb.checked = !cb.checked;
  cb.dispatchEvent(new Event('change'));
};
        cb.addEventListener('change', e => {
          const id = Number(e.target.dataset.id);
          if (e.target.checked) selectedIds.add(id); else selectedIds.delete(id);
          updateDeleteButtonText();
        });
      } else {
        li.innerHTML = `
          <div>
            <h3>${n.title}</h3>
            <p>${n.body.substring(0, 60)}${n.body.length > 60 ? '...' : ''}</p>
          </div>`;
        li.onclick = () => openEditor(n.id);
      }
      (n.pinned ? pinnedList : notesList).appendChild(li);
    });
    pinnedCount.textContent = sorted.filter(n => n.pinned).length;
    allCount.textContent = sorted.length;
    pinnedCount.style.display = pinnedCount.textContent == 0 ? 'none' : 'inline';
    allCount.style.display = allCount.textContent == 0 ? 'none' : 'inline';
  };

  const openEditor = id => {
    currentNote = notes.find(n => n.id === id);
    noteTitleInput.value = currentNote.title;
    noteBodyInput.value = currentNote.body;
    pinBtn.textContent = currentNote.pinned ? '📌' : '📌';
    listScreen.style.display = 'none';
    editorScreen.style.display = 'flex';
  };

  const closeEditor = () => {
    currentNote = null;
    editorScreen.style.display = 'none';
    listScreen.style.display = 'block';
  };

  selectAllBtn.onclick = () => {
    selectionMode = !selectionMode;
    if (!selectionMode) selectedIds.clear();
    selectAllBtn.textContent = selectionMode ? 'Отменить' : 'Выбрать все';
    if (selectionMode) {
      if (!document.getElementById('deleteAllBtn')) {
        const delBtn = document.createElement('button');
        delBtn.id = 'deleteAllBtn';
        delBtn.className = 'action-btn';
        delBtn.textContent = 'Удалить все';
        delBtn.onclick = () => {
          notes = selectedIds.size === 0 ? [] : notes.filter(n => !selectedIds.has(n.id));
          save(); selectedIds.clear(); selectionMode = false;
          selectAllBtn.textContent = 'Выбрать все';
          delBtn.remove(); render(searchInput.value.trim().toLowerCase());
        };
        selectAllBtn.parentNode.insertBefore(delBtn, selectAllBtn.nextSibling);
      }
    } else {
      const existing = document.getElementById('deleteAllBtn');
      if (existing) existing.remove();
    }
    render(searchInput.value.trim().toLowerCase());
  };

  pinBtn.onclick = () => {
    if (!currentNote) return;
    currentNote.pinned = !currentNote.pinned;
    pinBtn.textContent = currentNote.pinned ? '📌' : '📌';
    save(); render(searchInput.value.trim().toLowerCase()); closeEditor();
  };

  addBtn.onclick = () => {
    currentNote = { id: Date.now(), title: '', body: '', pinned: false };
    noteTitleInput.value = ''; noteBodyInput.value = ''; pinBtn.textContent = '📌';
    listScreen.style.display = 'none'; editorScreen.style.display = 'flex';
  };

  backBtn.onclick = closeEditor;

  doneBtn.onclick = () => {
    if (!currentNote) return;
    const title = noteTitleInput.value.trim();
    const body = noteBodyInput.value.trim();
    if (!title && !body) { closeEditor(); return; }
    currentNote.title = title || 'Без названия';
    currentNote.body = body;
    if (!notes.some(n => n.id === currentNote.id)) notes.unshift(currentNote);
    save(); render(searchInput.value.trim().toLowerCase()); closeEditor();
  };

  deleteBtn.onclick = () => {
    if (!currentNote) return;
    notes = notes.filter(n => n.id !== currentNote.id);
    save(); render(searchInput.value.trim().toLowerCase()); closeEditor();
  };

  sortSelect.addEventListener('change', () => render(searchInput.value.trim().toLowerCase()));
  searchInput.addEventListener('input', e => render(e.target.value.trim().toLowerCase()));
  render();
});