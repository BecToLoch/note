/* =========================================================
   Отрисовка интерфейса
   ========================================================= */

function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "\x26amp;")
    .replace(/</g, "\x3clt;")
    .replace(/>/g, "\x3egt;")
    .replace(/"/g, "\x22quot;")
    .replace(/'/g, "\x27#039;");
}

function renderSidebarCounts(notes) {
  const activeNotes = notes.filter((note) => !note.deletedAt);
  const deletedNotes = notes.filter((note) => note.deletedAt);

  document.getElementById("countAll").textContent = activeNotes.length;
  document.getElementById("countDeleted").textContent = deletedNotes.length;
  document.getElementById("totalNotes").textContent = activeNotes.length;

  ["Notes", "Work"].forEach((folderName) => {
    const countElement = document.getElementById("count" + folderName);

    if (countElement) {
      countElement.textContent = folderName === "Notes"
        ? activeNotes.filter((note) => note.tags.length === 0).length
        : activeNotes.filter((note) => note.tags.length > 0).length;
    }
  });

  Object.entries({
    countWorkTag: "work",
    countIdeas: "ideas",
    countTravel: "travel"
  }).forEach(([elementId, tagName]) => {
    const countElement = document.getElementById(elementId);

    if (countElement) {
      const count = activeNotes.filter((note) => note.tags.includes(tagName)).length;

      countElement.textContent = count;
      countElement.hidden = count === 0;
    }
  });

  renderSidebarTags(notes);
}

function renderSidebarTags(notes) {
  const tagsListElement = document.getElementById("tagsList");

  if (!tagsListElement) return;

  const activeNotes = notes.filter((note) => !note.deletedAt);
  const usedTagNames = tagOrder.filter((tagName) =>
    activeNotes.some((note) => note.tags.includes(tagName))
  );

  tagsListElement.innerHTML = usedTagNames.map((tagName) => {
    const tag = tagDefinitions[tagName];
    const count = activeNotes.filter((note) => note.tags.includes(tagName)).length;

    return `
      <button class="tag-sidebar-item" data-filter="tag:${tagName}">
        <span class="tag-dot ${getTagClass(tagName)}"></span>
        <span>${escapeHTML(tag.label)}</span>
        <span class="sidebar-count">${count}</span>
      </button>
    `;
  }).join("");
}

function getFilteredNotes(notes, activeFilter, searchTerm) {
  const normalizedSearch = normalizeText(searchTerm);

  return notes.filter((note) => {
    if (activeFilter === "deleted") {
      return Boolean(note.deletedAt);
    }

    if (note.deletedAt) {
      return false;
    }

    if (activeFilter.startsWith("folder:")) {
      const folderName = activeFilter.replace("folder:", "");

      if (folderName === "Notes" && note.tags.length > 0) return false;
      if (folderName === "Work" && note.tags.length === 0) return false;
    }

    if (activeFilter.startsWith("tag:") && !note.tags.includes(activeFilter.replace("tag:", ""))) {
      return false;
    }

    if (normalizedSearch) {
      const searchableText = normalizeText(note.title + " " + note.body + " " + note.tags.join(" "));

      if (!searchableText.includes(normalizedSearch)) return false;
    }

    return true;
  }).sort((a, b) => b.updatedAt - a.updatedAt);
}

function renderNotesList(notes, selectedNoteId, activeFilter, searchTerm, selectedTrashIds = [], trashSelectionMode = false) {
  const filteredNotes = getFilteredNotes(notes, activeFilter, searchTerm);
  const notesListElement = document.getElementById("notesList");
  const noteCountLabel = document.getElementById("noteCountLabel");
  const listTitle = document.getElementById("listTitle");
  const listHeader = listTitle.closest(".list-header");

  listTitle.textContent = getFilterTitle(activeFilter);
  renderTrashSelectButton(listHeader, filteredNotes, selectedTrashIds, trashSelectionMode);

  if (filteredNotes.length === 0) {
    notesListElement.innerHTML = `
      <div class="empty-list">
        Нет заметок
      </div>
    `;
    noteCountLabel.textContent = "0 Notes";
    return;
  }

  notesListElement.innerHTML = filteredNotes
    .map((note) => createNoteCardHTML(note, note.id === selectedNoteId, activeFilter, selectedTrashIds, trashSelectionMode))
    .join("");

  noteCountLabel.textContent = filteredNotes.length + " " + getNoteWord(filteredNotes.length);
}

function renderTrashSelectButton(listHeader, filteredNotes, selectedTrashIds, trashSelectionMode) {
  if (!listHeader) return;

  listHeader.querySelectorAll("[data-trash-select]").forEach((button) => button.remove());

  if (activeFilter !== "deleted") return;

  const selectedCount = filteredNotes.filter((note) => selectedTrashIds.includes(note.id)).length;
  const button = document.createElement("button");

  button.type = "button";
  button.className = "trash-select-button";
  button.dataset.trashSelect = "";

  if (!trashSelectionMode) {
    button.textContent = "Выбрать все";
  } else if (selectedCount === 0 || selectedCount === filteredNotes.length) {
    button.textContent = "Удалить все";
  } else {
    button.textContent = "Удалить";
  }

  listHeader.appendChild(button);
}

function createNoteCardHTML(note, isActive, activeFilter, selectedTrashIds, trashSelectionMode) {
  const isTrashSelection = activeFilter === "deleted" && trashSelectionMode;
  const isSelected = selectedTrashIds.includes(note.id);
  const hasTag = note.tags.length > 0;
  const tagClass = hasTag ? getTagClass(note.tags[0]) : "";
  const titleTagHTML = hasTag
    ? `<span class="note-card-title-tag ${tagClass}"><span class="tag-dot ${tagClass}"></span></span>`
    : "";
  const trashSelectCircle = isTrashSelection
    ? `<span class="trash-select-circle ${isSelected ? "selected" : ""}" data-trash-select-id="${note.id}"></span>`
    : "";

  return `
    <button class="note-card ${isActive ? "active" : ""} ${isTrashSelection ? "trash-selection" : ""}" data-note-id="${note.id}">
      ${trashSelectCircle}
      <div class="note-card-content">
        <div class="note-card-title">
          <span>${escapeHTML(note.title || "Без названия")}</span>
          ${titleTagHTML}
        </div>
        <div class="note-card-date">${formatDate(note.updatedAt)}</div>
        <div class="note-card-preview">${escapeHTML(getNotePreview(note))}</div>
      </div>
    </button>
  `;
}

function renderEditor(note) {
  const titleInput = document.getElementById("noteTitleInput");
  const bodyEditor = document.getElementById("noteBodyEditor");

  if (!note) {
    titleInput.value = "";
    titleInput.disabled = true;
    bodyEditor.innerHTML = "";
    bodyEditor.contentEditable = "false";
    bodyEditor.classList.add("inactive");
    bodyEditor.scrollTop = 0;
    titleInput.placeholder = "Без названия";
    return;
  }

  titleInput.value = note.title || "";
  titleInput.disabled = false;
  bodyEditor.innerHTML = note.body.includes("<")
    ? note.body
    : plainTextToHTML(note.body);
  bodyEditor.contentEditable = "true";
  bodyEditor.classList.remove("inactive");
  bodyEditor.scrollTop = 0;
  titleInput.placeholder = "Без названия";
}

function renderCurrentDate() {
  document.getElementById("currentDate").textContent = new Date().toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function renderActiveFilter(activeFilter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

function getFilterTitle(activeFilter) {
  if (activeFilter === "all") return "All Notes";
  if (activeFilter === "deleted") return "Recently Deleted";
  if (activeFilter === "folder:Work") return "Tags Note";
  if (activeFilter.startsWith("folder:")) return activeFilter.replace("folder:", "");
  if (activeFilter.startsWith("tag:")) {
    const tagName = activeFilter.replace("tag:", "");

    return tagLabels[tagName] || tagName;
  }

  return "Notes";
}

function getNoteWord(count) {
  return count === 1 ? "Note" : "Notes";
}

function getTagClass(tagName) {
  return "tag-" + tagName;
}