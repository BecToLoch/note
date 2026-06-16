/* =========================================================
   Логика приложения
   ========================================================= */

let notes = loadNotes();
let selectedNoteId = notes[0]?.id || null;
let activeFilter = "folder:Notes";
let searchTerm = "";
let trashSelectedIds = [];
let trashSelectionMode = false;

const els = {
  notesList: document.getElementById("notesList"),
  listHeader: document.querySelector(".list-header"),
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

  els.listHeader.addEventListener("click", (event) => {
    const selectButton = event.target.closest("[data-trash-select]");

    if (!selectButton) return;

    event.stopPropagation();
    handleTrashSelectAllClick();
  });

  els.notesList.addEventListener("click", (event) => {
    const trashSelectCircle = event.target.closest("[data-trash-select-id]");

    if (trashSelectCircle) {
      event.stopPropagation();
      toggleTrashSelection(trashSelectCircle.dataset.trashSelectId);
      return;
    }

    const noteCard = event.target.closest(".note-card");

    if (!noteCard) return;

    if (isDeletedFilter()) {
      toggleTrashSelection(noteCard.dataset.noteId);
    }

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
    if (activeFilter === "deleted" && filter !== "deleted") {
      trashSelectedIds = [];
      trashSelectionMode = false;
    }

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
  trashSelectedIds = [];
  trashSelectionMode = false;

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
  renderNotesList(notes, selectedNoteId, activeFilter, searchTerm, trashSelectedIds, trashSelectionMode);
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
    trashSelectedIds = trashSelectedIds.filter((id) => id !== selectedNote.id);
    trashSelectionMode = false;
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

function isDeletedFilter() {
  return activeFilter === "deleted";
}

function handleTrashSelectAllClick() {
  if (!isDeletedFilter()) return;

  const trashNotes = notes.filter((note) => note.deletedAt);

  if (trashNotes.length === 0) return;

  if (!trashSelectionMode) {
    trashSelectionMode = true;
    trashSelectedIds = [];
    renderNotesListOnly();
    return;
  }

  const selectedCount = trashSelectedIds.length;

  if (selectedCount === 0 || selectedCount === trashNotes.length) {
    notes = notes.filter((note) => !note.deletedAt);
    trashSelectedIds = [];
    trashSelectionMode = false;
    saveNotes(notes);
    renderAll();
    return;
  }

  if (selectedCount > 0) {
    notes = notes.filter((note) => !trashSelectedIds.includes(note.id));
    trashSelectedIds = [];
    trashSelectionMode = false;
    saveNotes(notes);
    renderAll();
  }
}

function toggleTrashSelection(noteId) {
  if (!isDeletedFilter() || !trashSelectionMode || !noteId) return;

  if (trashSelectedIds.includes(noteId)) {
    trashSelectedIds = trashSelectedIds.filter((id) => id !== noteId);
  } else {
    trashSelectedIds = [...trashSelectedIds, noteId];
  }

  renderNotesListOnly();
}
