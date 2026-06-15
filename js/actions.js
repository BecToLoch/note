// Действия пользователя: создание, сохранение, удаление, экспорт и блокировка заметок.
import { state, selectedColor, saveState } from "./state.js";
import {
  $,
  createId,
  defaultFolderId,
  escapeHTML,
  plainText,
  safeFilename
} from "./utils.js";
import { formatFullDate } from "./utils.js";
import { getSelectedNote, renderAll, renderNotesList, renderSidebar } from "./render.js";

export function createNoteFromModal() {
  const title = $("newNoteTitle").value.trim() || "Без названия";
  const bodyText = $("newNoteBody").value.trim();
  const body = bodyText
    ? `<p>${escapeHTML(bodyText.replace(/\n/g, "</p><p>"))}</p>`
    : "<p>Начните писать...</p>";

  const now = Date.now();
  const note = {
    id: createId("note"),
    title,
    folder: defaultFolderId(state.selectedFolder),
    tags: state.selectedTag && state.selectedTag !== "all-tags" ? [state.selectedTag] : [],
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    locked: false,
    body
  };

  state.notes.unshift(note);
  state.selectedNoteId = note.id;
  state.selectedFolder = note.folder;
  state.selectedTag = null;

  $("newNoteTitle").value = "";
  $("newNoteBody").value = "";

  saveState();
  closeAllModals();
  renderAll();
}

export function createFolderFromModal() {
  const name = $("newFolderName").value.trim();

  if (!name) {
    alert("Введите название папки.");
    return;
  }

  const folder = {
    id: createId("folder"),
    name,
    color: selectedColor
  };

  state.folders.push(folder);
  state.selectedFolder = folder.id;
  state.selectedTag = null;

  $("newFolderName").value = "";

  saveState();
  closeAllModals();
  renderAll();
}

export function saveCurrentEditor() {
  const note = getSelectedNote();

  if (!note || note.locked) return;

  note.title = $("titleInput").value.trim() || "Без названия";
  note.body = $("bodyEditor").innerHTML;
  note.updatedAt = Date.now();

  saveState();
  renderSidebar();
  renderNotesList();
  $("editorDate").textContent = formatFullDate(note.updatedAt);
}

export function deleteSelectedNote() {
  const note = getSelectedNote();

  if (!note) return;

  if (state.selectedFolder === "trash") {
    state.notes = state.notes.filter((item) => item.id !== note.id);
  } else {
    note.deletedAt = Date.now();
  }

  state.selectedNoteId = null;

  saveState();
  closeAllModals();
  renderAll();
}

export function handleLockButton() {
  const note = getSelectedNote();

  if (!note) {
    openModal("passwordModal");
    return;
  }

  if (note.locked) {
    $("lockPassword").value = "";
    openModal("lockModal");
    return;
  }

  note.locked = true;
  note.updatedAt = Date.now();

  saveState();
  renderAll();

  alert("Заметка заблокирована. Пароль по умолчанию: 123456");
}

export function unlockSelectedNote() {
  const note = getSelectedNote();

  if (!note || !$("lockPassword").value) {
    alert("Введите пароль.");
    return;
  }

  if ($("lockPassword").value === state.password) {
    note.locked = false;
    note.updatedAt = Date.now();

    saveState();
    closeAllModals();
    renderAll();
  } else {
    alert("Неверный пароль.");
  }
}

export function savePassword() {
  const first = $("passwordNew").value;
  const repeat = $("passwordRepeat").value;

  if (first.length < 6) {
    alert("Пароль должен содержать минимум 6 символов.");
    return;
  }

  if (first !== repeat) {
    alert("Пароли не совпадают.");
    return;
  }

  state.password = first;
  $("passwordNew").value = "";
  $("passwordRepeat").value = "";

  saveState();
  closeAllModals();

  alert("Пароль сохранён.");
}

export function saveSettings() {
  state.settings = {
    launch: $("launchSwitch").checked,
    updates: $("updateSwitch").checked,
    cloud: $("cloudSwitch").checked
  };

  saveState();
  closeAllModals();

  alert("Настройки сохранены.");
}

export function applyCommand(command) {
  const note = getSelectedNote();

  if (!note || note.locked) return;

  $("bodyEditor").focus();
  document.execCommand(command, false, null);
  saveCurrentEditor();
}

export function copyShareLink() {
  const note = getSelectedNote();

  if (!note) return;

  const text = `${note.title}\n\n${plainText(note.body)}`;

  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Текст заметки скопирован.");
    });
  } else {
    prompt("Скопируйте текст заметки:", text);
  }
}

export function searchInNote() {
  const note = getSelectedNote();

  if (!note || note.locked) return;

  const query = prompt("Найти в заметке:");

  if (!query) return;

  $("bodyEditor").focus();

  if (!window.find(query)) {
    alert("Текст не найден.");
  }
}

export function downloadExport() {
  const note = getSelectedNote();

  if (!note) return;

  const format = $("exportFormat").value;

  if (format === "PDF") {
    closeAllModals();
    window.print();
    return;
  }

  const content = getExportContent(note, format);
  const extension = format.toLowerCase();
  const filename = `${safeFilename(note.title)}.${extension}`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
  closeAllModals();
}

export function getExportContent(note, format) {
  if (format === "HTML") {
    return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(note.title)}</title>
</head>
<body>
  <h1>${escapeHTML(note.title)}</h1>
  ${note.body}
</body>
</html>`;
  }

  if (format === "Markdown") {
    return `# ${note.title}

${plainText(note.body)}`;
  }

  return `${note.title}\n\n${plainText(note.body)}`;
}