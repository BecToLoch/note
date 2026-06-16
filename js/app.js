/* =========================================================
   Логика приложения
   ========================================================= */

let notes = loadNotes();
let selectedNoteId = notes[0]?.id || null;
let activeFilter = "folder:Notes";
let searchTerm = "";

const els = {
  notesList: document.getElementById("notesList"),
  titleInput: document.getElementById("noteTitleInput"),
  bodyEditor: document.getElementById("noteBodyEditor"),
  searchInput: document.getElementById("searchInput"),
  searchClearButton: document.getElementById("searchClearButton"),
  createNoteButton: document.getElementById("createNoteButton"),
  deleteButton: document.getElementById("deleteButton"),
  tagButton: document.getElementById("tagButton"),
  formatButton: document.getElementById("formatButton"),
  formatPopover: document.getElementById("formatPopover"),
  tagPopover: document.getElementById("tagPopover")
};

renderCurrentDate();
renderAll();
setInterval(renderCurrentDate, 60_000);
bindEvents();

function bindEvents() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.addEventListener("click", () => selectFilter(button.dataset.filter));
  });

  els.notesList.addEventListener("click", (event) => {
    const noteCard = event.target.closest(".note-card");

    if (!noteCard) return;

    selectedNoteId = noteCard.dataset.noteId;
    renderNotesListOnly();
    renderEditor(getSelectedNote());
  });

  els.createNoteButton.addEventListener("click", createNewNote);
  els.deleteButton.addEventListener("click", deleteSelectedNote);
  els.tagButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeFormatPopover(els.formatPopover);
    toggleTagPopover(els.tagPopover);
  });
  els.formatButton.addEventListener("click", (event) => {
    event.stopPropagation();
    closeTagPopover(els.tagPopover);
    toggleFormatPopover(els.formatPopover);
  });

  els.searchInput.addEventListener("input", () => {
    searchTerm = els.searchInput.value;
    updateSearchClearButton();
    renderNotesListOnly();
  });

  els.searchClearButton.addEventListener("click", () => {
    clearSearch();
  });

  els.tagPopover.addEventListener("click", toggleNoteTag);
  els.formatPopover.addEventListener("click", applyFormatFromMenu);
  els.bodyEditor.addEventListener("input", handleBodyEditorInput);
  els.bodyEditor.addEventListener("keydown", (event) => handleBodyEditorHeadingEnter(event, els.bodyEditor));
  els.bodyEditor.addEventListener("keyup", () => saveBodyEditorSelection(els.bodyEditor));
  els.bodyEditor.addEventListener("mouseup", () => saveBodyEditorSelection(els.bodyEditor));
  els.formatPopover.addEventListener("mousedown", () => saveBodyEditorSelection(els.bodyEditor));

  document.addEventListener("click", handleDocumentClick);
  document.addEventListener("keydown", handleGlobalKeydown);

  els.titleInput.addEventListener("input", () => {
    updateSelectedNoteFromInputs();
    saveAndRenderAll();
  });
}

function selectFilter(filter) {
  activeFilter = filter;
  searchTerm = "";
  els.searchInput.value = "";
  renderAll();
}

function createNewNote() {
  const newNote = createNoteObject();

  notes.unshift(newNote);
  selectedNoteId = newNote.id;
  activeFilter = "all";
  searchTerm = "";
  els.searchInput.value = "";

  saveNotes(notes);
  renderAll();

  els.titleInput.focus();
  els.titleInput.select();
}

function toggleNoteTag(event) {
  const tagItem = event.target.closest(".tag-popover-item");

  if (!tagItem) return;

  event.stopPropagation();

  const selectedNote = getSelectedNote();
  const tagName = tagItem.dataset.tag;

  if (!selectedNote || !tagName) return;

  if (selectedNote.tags.length >= 1 && !selectedNote.tags.includes(tagName)) {
    closeTagPopover(els.tagPopover);
    renderAll();
    return;
  }

  if (!selectedNote.tags.includes(tagName)) {
    selectedNote.tags.push(tagName);
  }

  selectedNote.updatedAt = Date.now();
  activeFilter = `tag:${tagName}`;
  searchTerm = "";
  els.searchInput.value = "";

  saveNotes(notes);
  closeTagPopover(els.tagPopover);
  renderAll();
}

function applyFormatFromMenu(event) {
  const menuItem = event.target.closest(".format-menu-item");

  if (!menuItem) return;

  applyFormat(menuItem.dataset.format, els.bodyEditor);
  closeFormatPopover(els.formatPopover);
}

function handleDocumentClick(event) {
  if (
    !els.tagPopover.contains(event.target) &&
    !els.tagButton.contains(event.target) &&
    !els.tagPopover.classList.contains("hidden")
  ) {
    closeTagPopover(els.tagPopover);
  }

  if (!els.formatPopover.contains(event.target) && !els.formatButton.contains(event.target)) {
    closeFormatPopover(els.formatPopover);
  }
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape") {
    closeTagPopover(els.tagPopover);
    closeFormatPopover(els.formatPopover);
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "n") {
    event.preventDefault();
    els.createNoteButton.click();
  }
}

function handleBodyEditorInput() {
  wrapDirectTextNodes(els.bodyEditor);
  saveBodyEditorSelection(els.bodyEditor);
  updateSelectedNoteFromInputs();
  saveAndRenderAll();
}

function clearSearch() {
  els.searchInput.value = "";
  searchTerm = "";
  updateSearchClearButton();
  els.searchInput.focus();
  renderNotesListOnly();
}

function saveAndRenderAll() {
  saveNotes(notes);
  renderSidebarCounts(notes);
  renderNotesListOnly();
}

function renderAll() {
  syncSelectedNoteWithFilter();
  renderSidebarCounts(notes);
  renderNotesListOnly();
  renderActiveFilter(activeFilter);
  renderEditor(getSelectedNote());
}

function renderNotesListOnly() {
  renderNotesList(notes, selectedNoteId, activeFilter, searchTerm);
}

function updateSearchClearButton() {
  els.searchClearButton.classList.toggle("visible", els.searchInput.value.trim().length > 0);
}

function syncSelectedNoteWithFilter() {
  const filteredNotes = getFilteredNotes(notes, activeFilter, searchTerm);

  if (!filteredNotes.some((note) => note.id === selectedNoteId)) {
    selectedNoteId = filteredNotes[0]?.id || null;
  }
}

function getSelectedNote() {
  return findNoteById(notes, selectedNoteId);
}

function updateSelectedNoteFromInputs() {
  const selectedNote = getSelectedNote();

  if (!selectedNote) return;

  selectedNote.title = els.titleInput.value;
  selectedNote.body = els.bodyEditor.innerHTML;
  selectedNote.updatedAt = Date.now();
}

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

function toggleTagPopover(tagPopover) {
  if (!tagPopover) return;

  tagPopover.classList.toggle("hidden");
}

function closeTagPopover(tagPopover) {
  if (!tagPopover) return;

  tagPopover.classList.add("hidden");
}

function toggleFormatPopover(formatPopover) {
  if (!formatPopover) return;

  formatPopover.classList.toggle("hidden");
}

function closeFormatPopover(formatPopover) {
  if (!formatPopover) return;

  formatPopover.classList.add("hidden");
}