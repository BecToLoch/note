/* =========================================================
   Отрисовка интерфейса
   ========================================================= */

/*
  Защищает текст от вставки HTML-кода.
  Это важно, если пользователь введет специальные символы.
*/
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "\x26amp;")
    .replace(/</g, "\x3clt;")
    .replace(/>/g, "\x3egt;")
    .replace(/"/g, "\x22quot;")
    .replace(/'/g, "\x27#039;");
}

/*
  Считает заметки для разных фильтров:
  - все активные заметки;
  - папки Notes/Work;
  - Recently Deleted;
  - теги.
*/
function renderSidebarCounts(notes) {
  const activeNotes = notes.filter((note) => !note.deletedAt);
  const deletedNotes = notes.filter((note) => note.deletedAt);

  const folderNames = ["Notes", "Work"];
  const tagNames = tagOrder;

  document.getElementById("countAll").textContent = activeNotes.length;
  document.getElementById("countDeleted").textContent = deletedNotes.length;
  document.getElementById("totalNotes").textContent = activeNotes.length;

  folderNames.forEach((folderName) => {
    const countElement = document.getElementById("count" + folderName);

    if (countElement) {
      const visibleCount =
        folderName === "Notes"
          ? activeNotes.filter((note) => note.tags.length === 0).length
          : activeNotes.filter((note) => note.tags.length > 0).length;

      countElement.textContent = visibleCount;
    }
  });

  const tagCounts = {
    countWorkTag: "work",
    countIdeas: "ideas",
    countTravel: "travel"
  };

  Object.entries(tagCounts).forEach(([elementId, tagName]) => {
    const countElement = document.getElementById(elementId);

    if (countElement) {
      const count = activeNotes.filter((note) => note.tags.includes(tagName)).length;

      countElement.textContent = count;
      countElement.hidden = count === 0;
    }
  });

  renderSidebarTags(notes);
}

/*
  Отрисовывает теги в левой колонке.
*/
function renderSidebarTags(notes) {
  const tagsListElement = document.getElementById("tagsList");

  if (!tagsListElement) return;

  const activeNotes = notes.filter((note) => !note.deletedAt);
  const usedTagNames = tagOrder.filter((tagName) =>
    activeNotes.some((note) => note.tags.includes(tagName))
  );

  tagsListElement.innerHTML = usedTagNames
    .map((tagName) => {
      const tag = tagDefinitions[tagName];
      const count = activeNotes.filter((note) => note.tags.includes(tagName)).length;

      return `
        <button class="tag-sidebar-item" data-filter="tag:${tagName}">
          <span class="tag-dot ${getTagClass(tagName)}"></span>
          <span>${escapeHTML(tag.label)}</span>
          <span class="sidebar-count">${count}</span>
        </button>
      `;
    })
    .join("");
}

/*
  Возвращает заметки, которые нужно показать в средней колонке.
  Учитывает выбранную папку/тег, поиск и Recently Deleted.
*/
function getFilteredNotes(notes, activeFilter, searchTerm) {
  const normalizedSearch = normalizeText(searchTerm);

  return notes
    .filter((note) => {
      /*
        Если выбран Recently Deleted, показываем только удаленные.
        Иначе показываем только активные.
      */
      if (activeFilter === "deleted") {
        if (!note.deletedAt) return false;
      } else if (note.deletedAt) {
        return false;
      }

      /*
        Фильтр по папке.
        Например: folder:Notes.
      */
      if (activeFilter.startsWith("folder:")) {
        const folderName = activeFilter.replace("folder:", "");

        if (folderName === "Notes" && note.tags.length > 0) return false;
        if (folderName === "Work" && note.tags.length === 0) return false;
      }

      /*
        Фильтр по тегу.
        Например: tag:work.
      */
      if (activeFilter.startsWith("tag:")) {
        const tagName = activeFilter.replace("tag:", "");

        if (!note.tags.includes(tagName)) return false;
      }

      /*
        Поиск по заголовку, тексту и тегам.
      */
      if (normalizedSearch) {
        const searchableText = normalizeText(note.title + " " + note.body + " " + note.tags.join(" "));

        if (!searchableText.includes(normalizedSearch)) return false;
      }

      return true;
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

/*
  Отрисовывает список заметок в средней колонке.
*/
function renderNotesList(notes, selectedNoteId, activeFilter, searchTerm) {
  const filteredNotes = getFilteredNotes(notes, activeFilter, searchTerm);
  const notesListElement = document.getElementById("notesList");
  const noteCountLabel = document.getElementById("noteCountLabel");
  const listTitle = document.getElementById("listTitle");

  listTitle.textContent = getFilterTitle(activeFilter);

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
    .map((note) => createNoteCardHTML(note, note.id === selectedNoteId))
    .join("");

  noteCountLabel.textContent =
    filteredNotes.length + " " + getNoteWord(filteredNotes.length);
}

/*
  Создает HTML одной карточки заметки.
*/
function createNoteCardHTML(note, isActive) {
  const tagsHTML = note.tags
    .slice(0, 1)
    .map((tagName) => {
      const tag = tagDefinitions[tagName];
      const color = tag?.color || "#30d158";
      const label = tag?.label || tagName;

      return `<span class="note-card-tag ${getTagClass(tagName)}"><span class="tag-dot ${getTagClass(tagName)}"></span><span>${escapeHTML(label)}</span></span>`;
    })
    .join("");

  return `
    <button class="note-card ${isActive ? "active" : ""}" data-note-id="${note.id}">
      <div class="note-card-title">${escapeHTML(note.title || "Без названия")}</div>
      <div class="note-card-date">${formatDate(note.updatedAt)}</div>
      <div class="note-card-preview">${escapeHTML(getNotePreview(note))}</div>
      ${tagsHTML}
    </button>
  `;
}

/*
  Заполняет поля редактора данными выбранной заметки.
*/
function renderEditor(note) {
  const titleInput = document.getElementById("noteTitleInput");
  const bodyEditor = document.getElementById("noteBodyEditor");

  if (!note) {
    titleInput.value = "";
    bodyEditor.innerHTML = "";
    bodyEditor.scrollTop = 0;
    titleInput.placeholder = "Без названия";
    return;
  }

  titleInput.value = note.title || "";
  bodyEditor.innerHTML = note.body.includes("<")
    ? note.body
    : plainTextToHTML(note.body);
  bodyEditor.scrollTop = 0;

  titleInput.placeholder = "Без названия";

}

/*
  Показывает текущую дату в верхней строке.
*/
function renderCurrentDate() {
  const currentDateElement = document.getElementById("currentDate");
  const now = new Date();

  currentDateElement.textContent = now.toLocaleString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

/*
  Обновляет активную кнопку в левой колонке.
*/
function renderActiveFilter(activeFilter) {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === activeFilter);
  });
}

/*
  Возвращает заголовок средней колонки для выбранного фильтра.
*/
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

/*
  Возвращает правильное слово "Note/Notes" для английской подписи.
*/
function getNoteWord(count) {
  return count === 1 ? "Note" : "Notes";
}

/*
  Переводит HEX-цвет в RGBA.
  Нужно для полупрозрачного фона тегов.
*/
function getTagClass(tagName) {
  return "tag-" + tagName;
}

function hexToRgba(hex, alpha) {
  const normalizedHex = hex.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}
