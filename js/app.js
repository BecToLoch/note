/* =========================================================
   Логика приложения
   ========================================================= */

/*
  notes — главный массив с заметками.
  selectedNoteId — id заметки, которая сейчас открыта справа.
  activeFilter — выбранный фильтр слева: папка, тег, all или deleted.
  searchTerm — текст, который пользователь ввел в поиск.
*/
let notes = loadNotes();
let selectedNoteId = notes[0]?.id || null;
let activeFilter = "folder:Notes";
let searchTerm = "";

/*
  Получаем элементы интерфейса.
  Так код проще читать: не нужно каждый раз писать document.getElementById.
*/
const notesListElement = document.getElementById("notesList");
const titleInput = document.getElementById("noteTitleInput");
const bodyEditor = document.getElementById("noteBodyEditor");
const searchInput = document.getElementById("searchInput");
const modal = document.getElementById("noteModal");
const folderSelect = document.getElementById("folderSelect");
const formatButton = document.getElementById("formatButton");
const formatPopover = document.getElementById("formatPopover");
const tagPopover = document.getElementById("tagPopover");

/*
  Первый запуск приложения:
  - показываем текущую дату;
  - отрисовываем все блоки;
  - выбираем заметку, если она есть.
*/
renderCurrentDate();
renderAll();

/*
  Пересчитываем дату каждую минуту,
  чтобы верхняя строка не устаревала.
*/
setInterval(renderCurrentDate, 60_000);

/*
  Навешиваем обработчики событий.
  Обработчик события — это функция, которая запускается
  при клике, вводе текста или другом действии пользователя.
*/
document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    searchTerm = "";
    searchInput.value = "";

    renderAll();
  });
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value;

  renderNotesListOnly();
});

notesListElement.addEventListener("click", (event) => {
  /*
    event.target.closest(".note-card") ищет ближайшую карточку заметки.
    Это нужно, потому что клик может быть не по самой кнопке,
    а по тексту внутри нее.
  */
  const noteCard = event.target.closest(".note-card");

  if (!noteCard) return;

  selectedNoteId = noteCard.dataset.noteId;

  renderNotesListOnly();
  renderEditor(getSelectedNote());
});

document.getElementById("createNoteButton").addEventListener("click", () => {
  const newNote = createNoteObject();

  notes.unshift(newNote);
  selectedNoteId = newNote.id;
  activeFilter = "all";
  searchTerm = "";
  searchInput.value = "";

  saveNotes(notes);
  renderAll();

  titleInput.focus();
  titleInput.select();
});

document.getElementById("deleteButton").addEventListener("click", () => {
  deleteSelectedNote();
});

document.getElementById("tagButton").addEventListener("click", (event) => {
  event.stopPropagation();
  toggleTagPopover(tagPopover);
});

tagPopover.addEventListener("click", (event) => {
  const tagItem = event.target.closest(".tag-popover-item");

  if (!tagItem) return;

  const selectedNote = getSelectedNote();
  const tagName = tagItem.dataset.filter.replace("tag:", "");

  if (!selectedNote) return;

  if (!selectedNote.tags.includes(tagName)) {
    selectedNote.tags.push(tagName);
  }

  selectedNote.updatedAt = Date.now();
  activeFilter = tagItem.dataset.filter;
  searchTerm = "";
  searchInput.value = "";

  saveNotes(notes);
  closeTagPopover(tagPopover);
  renderAll();
});

document.addEventListener("click", (event) => {
  if (!tagPopover || tagPopover.classList.contains("hidden")) return;

  const tagButton = document.getElementById("tagButton");

  if (!tagPopover.contains(event.target) && !tagButton.contains(event.target)) {
    closeTagPopover(tagPopover);
  }
});

formatButton.addEventListener("click", (event) => {
  /*
    Кнопка "T" открывает меню форматирования как на макете.
    stopPropagation нужен, чтобы клик по кнопке не ушел в document
    и меню сразу не закрылось.
  */
  event.stopPropagation();
  toggleFormatPopover(formatPopover);
});

formatPopover.addEventListener("click", (event) => {
  /*
    Если клик был по пункту меню, применяем форматирование
    к выделенному тексту в поле заметки.
  */
  const menuItem = event.target.closest(".format-menu-item");

  if (!menuItem) return;

  applyFormat(menuItem.dataset.format);
  closeFormatPopover(formatPopover);
});

document.addEventListener("click", (event) => {
  /*
    Закрываем меню, если клик был вне кнопки T и вне самого меню.
  */
  const clickedInsidePopover = formatPopover.contains(event.target);
  const clickedFormatButton = formatButton.contains(event.target);

  if (!clickedInsidePopover && !clickedFormatButton) {
    closeFormatPopover(formatPopover);
  }
});

const saveBtn = document.getElementById("saveNoteSettings");
if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    saveSelectedNoteSettings();
  });
}

const cancelBtn = document.getElementById("cancelNoteSettings");
if (cancelBtn) {
  cancelBtn.addEventListener("click", () => {
    closeNoteSettingsModal();
  });
}

if (modal) {
  modal.addEventListener("click", (event) => {
    /*
      Если кликнуть по темному фону модального окна,
      окно закроется.
    */
    if (event.target === modal) {
      closeNoteSettingsModal();
    }
  });
}

document.addEventListener("keydown", (event) => {
  /*
    Escape закрывает модальное окно и меню форматирования.
  */
  if (event.key === "Escape") {
    closeNoteSettingsModal();
    closeTagPopover(tagPopover);
    closeFormatPopover(formatPopover);
  }

  /*
    Ctrl/Cmd + N создает новую заметку.
  */
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    document.getElementById("createNoteButton").click();
  }
});

titleInput.addEventListener("input", () => {
  updateSelectedNoteFromInputs();
  saveNotes(notes);
  renderSidebarCounts(notes);
  renderNotesListOnly();
});

bodyEditor.addEventListener("input", () => {
  updateSelectedNoteFromInputs();
  saveNotes(notes);
  renderSidebarCounts(notes);
  renderNotesListOnly();
});

bodyEditor.addEventListener("keydown", (event) => {
  handleBodyEditorHeadingEnter(event, bodyEditor);
});

/*
  Отрисовывает все основные блоки приложения.
*/
function renderAll() {
  syncSelectedNoteWithFilter();

  renderSidebarCounts(notes);
  renderNotesListOnly();
  renderActiveFilter(activeFilter);
  renderEditor(getSelectedNote());
}

/*
  Отрисовывает только список заметок.
  Это нужно при вводе текста, чтобы не сбрасывать курсор в редакторе.
*/
function renderNotesListOnly() {
  renderNotesList(notes, selectedNoteId, activeFilter, searchTerm);
}

/*
  Если выбранная заметка не попадает под текущий фильтр,
  выбираем первую заметку из отфильтрованного списка.
*/
function syncSelectedNoteWithFilter() {
  const filteredNotes = getFilteredNotes(notes, activeFilter, searchTerm);

  if (!filteredNotes.some((note) => note.id === selectedNoteId)) {
    selectedNoteId = filteredNotes[0]?.id || null;
  }
}

/*
  Возвращает выбранную заметку из массива notes.
*/
function getSelectedNote() {
  return findNoteById(notes, selectedNoteId);
}

/*
  Обновляет выбранную заметку данными из полей заголовка и текста.
*/
function updateSelectedNoteFromInputs() {
  const selectedNote = getSelectedNote();

  if (!selectedNote) return;

  selectedNote.title = titleInput.value;
  selectedNote.body = bodyEditor.innerHTML;
  selectedNote.updatedAt = Date.now();
}

/*
  Перемещает выбранную заметку в Recently Deleted.
  Если заметка уже удалена, удаляем ее полностью.
*/
function deleteSelectedNote() {
  const selectedNote = getSelectedNote();

  if (!selectedNote) return;

  if (!selectedNote.deletedAt) {
    selectedNote.deletedAt = Date.now();
  } else {
    notes = notes.filter((note) => note.id !== selectedNote.id);
  }

  saveNotes(notes);
  renderAll();
}

/*
  Открывает окно настройки папки и тегов.
*/
function openNoteSettingsModal() {
  const selectedNote = getSelectedNote();

  if (!selectedNote) return;

  folderSelect.value = selectedNote.folder || "Notes";
  tagInput.value = selectedNote.tags.join(", ");

  modal.classList.remove("hidden");
}

/*
  Закрывает окно настройки папки и тегов.
*/
function closeNoteSettingsModal() {
  if (!modal) return;

  modal.classList.add("hidden");
}

/*
  Сохраняет папку и теги выбранной заметки.
*/
function saveSelectedNoteSettings() {
  const selectedNote = getSelectedNote();

  if (!selectedNote) return;

  selectedNote.folder = folderSelect.value;
  selectedNote.tags = parseTags(tagInput.value);
  selectedNote.updatedAt = Date.now();

  saveNotes(notes);
  closeNoteSettingsModal();
  renderAll();
}

/*
  Превращает строку тегов в массив.
  Пример: "finance, ideas" -> ["finance", "ideas"]
*/
function parseTags(text) {
  return text
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag.length > 0);
}

function toggleTagPopover(tagPopover) {
  if (!tagPopover) return;

  tagPopover.classList.toggle("hidden");
}

function closeTagPopover(tagPopover) {
  if (!tagPopover) return;

  tagPopover.classList.add("hidden");
}

