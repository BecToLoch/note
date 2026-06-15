// Сгенерированный классический скрипт для запуска без локального сервера (file://).
// Исходники остаются в папке js/.

// --- js/config.js ---
// Базовые настройки приложения.
const STORAGE_KEY = "notes-app-v1";

const DEFAULT_FOLDER_IDS = ["notes", "ideas", "work"];

const TAG_LABELS = {
  important: "Важно",
  idea: "Идея",
  personal: "Личное",
  learning: "Учёба",
  plans: "Планы"
};

// Начальные заметки. Они показываются, если у пользователя ещё нет своих данных.
function getDefaultState() {
  const now = Date.now();

  return {
    notes: [
      {
        id: "note-1",
        title: "Идеи для проекта",
        folder: "ideas",
        tags: ["important", "idea", "plans"],
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
        updatedAt: now - 1000 * 60 * 60 * 2,
        deletedAt: null,
        locked: false,
        body: `
          <p>Веб-приложение для планирования задач с фокусом на простоту и минимализм.</p>
          <h3>Основные функции:</h3>
          <ul>
            <li>Создание и управление задачами</li>
            <li>Проекты и категории</li>
            <li>Календарь и напоминания</li>
            <li>Статистика продуктивности</li>
            <li>Тёмная тема 🌙</li>
          </ul>
          <h3>Следующие шаги:</h3>
          <ul>
            <li>Исследование конкурентов</li>
            <li>Прототип интерфейса</li>
            <li>Планирование базы данных</li>
            <li>Выбор стека технологий</li>
          </ul>
        `
      },
      {
        id: "note-2",
        title: "План на неделю",
        folder: "work",
        tags: ["plans"],
        createdAt: now - 1000 * 60 * 60 * 24 * 2,
        updatedAt: now - 1000 * 60 * 60 * 24,
        deletedAt: null,
        locked: false,
        body: `
          <p><b>Понедельник:</b> разобрать задачи проекта.</p>
          <p><b>Вторник:</b> подготовить прототип.</p>
          <p><b>Среда:</b> проверить интерфейс на мобильных устройствах.</p>
        `
      },
      {
        id: "note-3",
        title: "Книги к прочтению",
        folder: "notes",
        tags: ["personal"],
        createdAt: now - 1000 * 60 * 60 * 24 * 6,
        updatedAt: now - 1000 * 60 * 60 * 24 * 4,
        deletedAt: null,
        locked: false,
        body: `
          <p>Список книг, которые стоит прочитать в этом месяце:</p>
          <ul>
            <li>«Джедайские техники»</li>
            <li>«Поток»</li>
            <li>«Думай медленно... решай быстро»</li>
          </ul>
        `
      }
    ],
    folders: [
      { id: "notes", name: "Заметки", color: "#f5c542" },
      { id: "ideas", name: "Идеи", color: "#0a84ff" },
      { id: "work", name: "Работа", color: "#30d158" }
    ],
    settings: {
      launch: true,
      updates: true,
      cloud: true
    },
    selectedFolder: "all",
    selectedTag: null,
    selectedNoteId: "note-1",
    password: "123456"
  };
}
// --- js/utils.js ---
// Небольшие вспомогательные функции, которые используются в разных частях проекта.

const $ = (id) => document.getElementById(id);

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function plainText(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
}

function escapeHTML(value) {
  const map = {
    "&": "\u0026amp;",
    "<": "\u0026lt;",
    ">": "\u0026gt;",
    '"': "\u0026quot;",
    "'": "\u0026#039;"
  };

  return String(value).replace(/[&<>"']/g, (char) => map[char]);
}

function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("`", "&#096;");
}

function safeFilename(value) {
  return value.replace(/[^\wа-яА-ЯёЁ-]+/g, "_").slice(0, 40) || "note";
}

function openModal(id) {
  const backdrop = $("modalBackdrop");
  const modal = $(id);

  if (!backdrop || !modal) return;

  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");

  const firstInput = modal.querySelector("input, textarea, select, button");
  if (firstInput) firstInput.focus();
}

function closeAllModals() {
  const backdrop = $("modalBackdrop");

  if (backdrop) backdrop.classList.add("hidden");

  document.querySelectorAll(".modal-card").forEach((modal) => modal.classList.add("hidden"));
}

function tagLabel(tag) {
  return TAG_LABELS[tag] || tag;
}

function getFolderName(folders, folderId) {
  const folder = folders.find((item) => item.id === folderId);
  return folder ? folder.name : "Заметки";
}

function defaultFolderId(selectedFolder) {
  if (selectedFolder && selectedFolder !== "all" && selectedFolder !== "trash") {
    return selectedFolder;
  }

  return "notes";
}

function formatShortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short"
  });
}

function formatFullDate(timestamp) {
  const date = new Date(timestamp);

  return (
    date.toLocaleDateString("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }) +
    " в " +
    date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit"
    })
  );
}

function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

function getSectionName(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Сегодня";
  if (isSameDay(date, yesterday)) return "Вчера";

  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}
// --- js/state.js ---
// Хранение состояния приложения.
// Здесь лежит только загрузка/сохранение данных и выбранный цвет новой папки.

let state = loadState();
let selectedColor = "#f5c542";

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return getDefaultState();

  try {
    const parsed = JSON.parse(saved);
    const defaults = getDefaultState();

    return {
      ...defaults,
      ...parsed,
      notes: parsed.notes || defaults.notes,
      folders: parsed.folders || defaults.folders,
      settings: parsed.settings || defaults.settings
    };
  } catch (error) {
    return getDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
// --- js/render.js ---
// Отрисовка интерфейса: боковая панель, список заметок и редактор.

function renderAll() {
  ensureSelectedNote();
  renderSidebar();
  renderNotesList();
  renderEditor();
}

function renderSidebar() {
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

function renderCustomFolders() {
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

function renderNotesList() {
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

function renderEditor() {
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

function ensureSelectedNote() {
  const visibleNotes = getVisibleNotes();

  if (visibleNotes.length > 0 && !visibleNotes.some((note) => note.id === state.selectedNoteId)) {
    state.selectedNoteId = visibleNotes[0].id;
  }

  if (!state.selectedNoteId) {
    const fallback = getActiveNotes()[0] || getDeletedNotes()[0];
    state.selectedNoteId = fallback ? fallback.id : null;
  }
}

function getVisibleNotes() {
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

function getActiveNotes() {
  return state.notes.filter((note) => !note.deletedAt);
}

function getDeletedNotes() {
  return state.notes.filter((note) => note.deletedAt);
}

function getSelectedNote() {
  return state.notes.find((note) => note.id === state.selectedNoteId) || null;
}

function countByTag(tag) {
  return getActiveNotes().filter((note) => note.tags.includes(tag)).length;
}

function groupNotesByDate(notes) {
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
// --- js/actions.js ---
// Действия пользователя: создание, сохранение, удаление, экспорт и блокировка заметок.

function createNoteFromModal() {
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

function createFolderFromModal() {
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

function saveCurrentEditor() {
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

function deleteSelectedNote() {
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

function handleLockButton() {
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

function unlockSelectedNote() {
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

function savePassword() {
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

function saveSettings() {
  state.settings = {
    launch: $("launchSwitch").checked,
    updates: $("updateSwitch").checked,
    cloud: $("cloudSwitch").checked
  };

  saveState();
  closeAllModals();

  alert("Настройки сохранены.");
}

function applyCommand(command) {
  const note = getSelectedNote();

  if (!note || note.locked) return;

  $("bodyEditor").focus();
  document.execCommand(command, false, null);
  saveCurrentEditor();
}

function copyShareLink() {
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

function searchInNote() {
  const note = getSelectedNote();

  if (!note || note.locked) return;

  const query = prompt("Найти в заметке:");

  if (!query) return;

  $("bodyEditor").focus();

  if (!window.find(query)) {
    alert("Текст не найден.");
  }
}

function downloadExport() {
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

function getExportContent(note, format) {
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
// --- js/events.js ---
// Обработчики событий: клики, ввод текста, горячие клавиши.

function bindEvents() {
  bindSidebarEvents();
  bindSearchEvents();
  bindModalButtons();
  bindEditorEvents();
  bindActionButtons();
  bindFormattingButtons();
  bindKeyboard();
}

function bindSidebarEvents() {
  document.querySelectorAll("[data-folder]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedFolder = button.dataset.folder;
      state.selectedTag = null;
      saveState();
      renderAll();
    });
  });

  document.querySelectorAll("[data-tag]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedTag = button.dataset.tag;
      state.selectedFolder = "all";
      saveState();
      renderAll();
    });
  });

  $("customFolders").addEventListener("click", (event) => {
    const button = event.target.closest("[data-folder]");

    if (!button) return;

    state.selectedFolder = button.dataset.folder;
    state.selectedTag = null;
    saveState();
    renderAll();
  });
}

function bindSearchEvents() {
  $("searchInput").addEventListener("input", renderAll);
  $("clearSearchBtn").addEventListener("click", () => {
    $("searchInput").value = "";
    renderAll();
  });
}

function bindModalButtons() {
  $("modalBackdrop").addEventListener("click", closeAllModals);

  document.querySelectorAll("[data-close-modal]").forEach((button) => {
    button.addEventListener("click", closeAllModals);
  });

  document.querySelectorAll(".color-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      selectedColor = dot.dataset.color;
      document.querySelectorAll(".color-dot").forEach((item) => item.classList.remove("selected"));
      dot.classList.add("selected");
    });
  });
}

function bindEditorEvents() {
  $("titleInput").addEventListener("input", saveCurrentEditor);
  $("bodyEditor").addEventListener("input", saveCurrentEditor);
}

function bindActionButtons() {
  $("newNoteBtn").addEventListener("click", () => openModal("newNoteModal"));
  $("newFolderBtn").addEventListener("click", () => openModal("newFolderModal"));
  $("newFolderTextBtn").addEventListener("click", () => openModal("newFolderModal"));
  $("settingsBtn").addEventListener("click", () => openModal("settingsModal"));
  $("deleteNoteBtn").addEventListener("click", () => openModal("deleteModal"));
  $("exportBtn").addEventListener("click", () => openModal("exportModal"));
  $("lockNoteBtn").addEventListener("click", handleLockButton);

  $("createNoteBtn").addEventListener("click", createNoteFromModal);
  $("createFolderBtn").addEventListener("click", createFolderFromModal);
  $("confirmDeleteBtn").addEventListener("click", deleteSelectedNote);
  $("downloadExportBtn").addEventListener("click", downloadExport);
  $("unlockNoteBtn").addEventListener("click", unlockSelectedNote);
  $("savePasswordBtn").addEventListener("click", savePassword);
  $("saveSettingsBtn").addEventListener("click", saveSettings);
  $("shareBtn").addEventListener("click", copyShareLink);
  $("searchInNoteBtn").addEventListener("click", searchInNote);
}

function bindFormattingButtons() {
  $("boldBtn").addEventListener("click", () => applyCommand("bold"));
  $("italicBtn").addEventListener("click", () => applyCommand("italic"));
  $("underlineBtn").addEventListener("click", () => applyCommand("underline"));
  $("strikeBtn").addEventListener("click", () => applyCommand("strikeThrough"));
  $("bulletListBtn").addEventListener("click", () => applyCommand("insertUnorderedList"));
  $("alignLeftBtn").addEventListener("click", () => applyCommand("justifyLeft"));
}

function bindKeyboard() {
  document.addEventListener("keydown", handleKeyboard);
}

function handleKeyboard(event) {
  const isMac = navigator.platform.toUpperCase().includes("MAC");
  const modifier = isMac ? event.metaKey : event.ctrlKey;
  const key = event.key.toLowerCase();

  if (modifier && key === "n") {
    event.preventDefault();
    event.shiftKey ? openModal("newFolderModal") : openModal("newNoteModal");
  }

  if (modifier && key === "f") {
    event.preventDefault();
    $("searchInput").focus();
  }

  if (modifier && key === ",") {
    event.preventDefault();
    openModal("settingsModal");
  }

  if (modifier && key === "e") {
    event.preventDefault();
    openModal("exportModal");
  }

  if (modifier && key === "l") {
    event.preventDefault();
    handleLockButton();
  }

  if ((event.key === "Delete" || event.key === "Backspace") && !isTyping()) {
    openModal("deleteModal");
  }
}

function isTyping() {
  const active = document.activeElement;

  return (
    active &&
    (
      active.tagName === "INPUT" ||
      active.tagName === "TEXTAREA" ||
      active.isContentEditable
    )
  );
}
// --- js/main.js ---
// Точка входа приложения.
// Здесь запускается первая отрисовка и подключаются обработчики событий.

function initApp() {
  renderAll();
  bindEvents();
}
initApp();
