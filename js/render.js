// Отрисовка интерфейса: боковая панель, список заметок и редактор.
import { DEFAULT_FOLDER_IDS } from "./config.js";
import { state } from "./state.js";
import {
  $,
  escapeAttribute,
  escapeHTML,
  formatFullDate,
  formatShortDate,
  getFolderName,
  getSectionName,
  plainText,
  tagLabel
} from "./utils.js";

export function renderAll() {
  ensureSelectedNote();
  renderSidebar();
  renderNotesList();
  renderEditor();
}

export function renderSidebar() {
  const activeNotes = getActiveNotes();
  const deletedNotes = getDeletedNotes();

  $("countAll").textContent = activeNotes.length;
  $("countNotes").textContent = activeNotes.filter((note) => note.folder === "notes").length;
  $("countIdeas").textContent = activeNotes.filter((note) => note.folder === "ideas").length;
  $("countWork").textContent = activeNotes.filter((note) => note.folder === "work").length;
  $("countTrash").textContent = deletedNotes.length;

  $("countImportant").textContent = countByTag("important");
  $("countIdea").textContent = countByTag("idea");
  $("countPersonal").textContent = countByTag("personal");
  $("countLearning").textContent = countByTag("learning");
  $("countPlans").textContent = countByTag("plans");
  $("countAllTags").textContent = activeNotes.reduce((sum, note) => sum + note.tags.length, 0);

  document.querySelectorAll("[data-folder]").forEach((button) => {
    button.classList.toggle("active", state.selectedFolder === button.dataset.folder && !state.selectedTag);
  });

  document.querySelectorAll("[data-tag]").forEach((button) => {
    button.classList.toggle("active", state.selectedTag === button.dataset.tag);
  });

  renderCustomFolders();
}

export function renderCustomFolders() {
  const customFolders = state.folders.filter((folder) => !DEFAULT_FOLDER_IDS.includes(folder.id));
  const container = $("customFolders");

  container.innerHTML = customFolders
    .map((folder) => {
      const count = getActiveNotes().filter((note) => note.folder === folder.id).length;
      const active = state.selectedFolder === folder.id && !state.selectedTag;

      return `
        <button class="folder-item ${active ? "active" : ""}" data-folder="${escapeAttribute(folder.id)}">
          <span class="custom-folder-icon" style="background:${escapeAttribute(folder.color)}"></span>
          <span>${escapeHTML(folder.name)}</span>
          <span class="count">${count}</span>
        </button>
      `;
    })
    .join("");
}

export function renderNotesList() {
  ensureSelectedNote();

  const notes = getVisibleNotes();
  const container = $("notesList");
  container.innerHTML = "";

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-list">
        <div>📝</div>
        <h3>Нет заметок</h3>
        <p>Создайте новую заметку или измените фильтр.</p>
      </div>
    `;
    return;
  }

  const groups = groupNotesByDate(notes);

  Object.keys(groups).forEach((groupName) => {
    const title = document.createElement("div");
    title.className = "list-section-title";
    title.textContent = groupName;
    container.appendChild(title);

    groups[groupName].forEach((note) => {
      const card = document.createElement("button");
      card.className = `note-card ${note.id === state.selectedNoteId ? "active" : ""}`;
      card.innerHTML = `
        <h3>${escapeHTML(note.title)}</h3>
        <p>${escapeHTML(plainText(note.body).slice(0, 90))}</p>
        <div class="note-card-footer">
          <span class="note-preview">${note.tags.map(tagLabel).join(" ")}</span>
          <span>${formatShortDate(note.updatedAt)}</span>
        </div>
      `;

      card.addEventListener("click", () => {
        state.selectedNoteId = note.id;
        renderAll();
      });

      container.appendChild(card);
    });
  });
}

export function renderEditor() {
  const note = getSelectedNote();

  if (!note) {
    $("titleInput").value = "";
    $("bodyEditor").innerHTML = "";
    $("editorDate").textContent = "Нет заметки";
    $("editorFolder").textContent = "";
    $("titleInput").disabled = true;
    $("bodyEditor").contentEditable = "false";
    $("bodyEditor").classList.remove("is-locked");
    return;
  }

  $("titleInput").disabled = note.locked;
  $("bodyEditor").contentEditable = note.locked ? "false" : "true";
  $("bodyEditor").classList.toggle("is-locked", note.locked);
  $("titleInput").value = note.title;
  $("bodyEditor").innerHTML = note.locked
    ? `<div class="locked-message">🔒 Эта заметка заблокирована. Нажмите 🔒 в панели инструментов, чтобы ввести пароль.</div>`
    : note.body;
  $("editorDate").textContent = formatFullDate(note.updatedAt);
  $("editorFolder").textContent = getFolderName(state.folders, note.folder);
}

export function ensureSelectedNote() {
  const visibleNotes = getVisibleNotes();

  if (visibleNotes.length > 0 && !visibleNotes.some((note) => note.id === state.selectedNoteId)) {
    state.selectedNoteId = visibleNotes[0].id;
  }

  if (!state.selectedNoteId) {
    const fallback = getActiveNotes()[0] || getDeletedNotes()[0];
    state.selectedNoteId = fallback ? fallback.id : null;
  }
}

export function getVisibleNotes() {
  const query = $("searchInput") ? $("searchInput").value.trim().toLowerCase() : "";
  let notes;

  if (state.selectedFolder === "trash") {
    notes = getDeletedNotes();
  } else {
    notes = getActiveNotes();

    if (state.selectedFolder !== "all") {
      notes = notes.filter((note) => note.folder === state.selectedFolder);
    }

    if (state.selectedTag) {
      notes = notes.filter((note) => note.tags.includes(state.selectedTag));
    }
  }

  if (query) {
    notes = notes.filter((note) => {
      const bodyText = plainText(note.body).toLowerCase();
      return note.title.toLowerCase().includes(query) || bodyText.includes(query);
    });
  }

  return notes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getActiveNotes() {
  return state.notes.filter((note) => !note.deletedAt);
}

export function getDeletedNotes() {
  return state.notes.filter((note) => note.deletedAt);
}

export function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedNoteId) || null;
}

export function countByTag(tag) {
  return getActiveNotes().filter((note) => note.tags.includes(tag)).length;
}

export function groupNotesByDate(notes) {
  const groups = {};

  notes.forEach((note) => {
    const groupName = getSectionName(note.updatedAt);

    if (!groups[groupName]) {
      groups[groupName] = [];
    }

    groups[groupName].push(note);
  });

  return groups;
}