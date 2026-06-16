/* =========================================================
   Начальные данные приложения
   ========================================================= */

/*
  Начальная заметка.
  Папка изменена на Notes, потому что папка Personal удалена.
  Тело заметки теперь хранится как HTML, чтобы работало настоящее
  форматирование: заголовки, жирный текст, списки и т.д.
*/
const initialNotes = [
  {
    id: "note-1",
    title: "Gift ideas — Mom's birthday",
    body:
      "<p>August 14th!</p><p>Ideas:</p><ul><li>Le Creuset Dutch oven (she's been hinting)</li><li>Weekend at a winery in Sonoma</li><li>Fancy olive oil + cookbook set</li><li>SpaFinder gift card</li><li>Custom photo book from last summer's trip</li></ul><p>Budget: ~$200</p><p>Order deadline: August 7 (shipping buffer)</p>",
    folder: "Notes",
    tags: ["ideas"],
    updatedAt: new Date("2026-06-03T19:00:00").getTime(),
    deletedAt: null
  }
];

const tagDefinitions = {
  work: {
    label: "Важное",
    color: "#ff453a"
  },
  ideas: {
    label: "Работа",
    color: "#5e5ce6"
  },
  travel: {
    label: "Личное",
    color: "#30d158"
  }
};

const tagOrder = Object.keys(tagDefinitions);
const tagLabels = Object.fromEntries(
  Object.entries(tagDefinitions).map(([tagName, tag]) => [tagName, tag.label])
);
const tagColors = Object.fromEntries(
  Object.entries(tagDefinitions).map(([tagName, tag]) => [tagName, tag.color])
);

/*
  Форматирует дату заметки для карточки в средней колонке.
*/
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "short" });

  return `${month} ${day}`;
}

/*
  Делает короткое описание заметки.
  body может быть HTML, поэтому сначала убираем HTML-теги.
*/
function getNotePreview(note) {
  const text = getFirstTextLine(note.body);

  if (!text) {
    return "No additional text";
  }

  return text;
}

function getFirstTextLine(html) {
  const tempElement = document.createElement("div");

  tempElement.innerHTML = String(html || "").replace(/<br\s*\/?>/gi, "\n");

  return getFirstBlockText(tempElement);
}

function getFirstBlockText(element) {
  const children = Array.from(element.children);

  for (const child of children) {
    if (isBlockElement(child)) {
      return getFirstBlockText(child);
    }
  }

  return normalizePreviewText(element.textContent).split("\n")[0] || "";
}

function isBlockElement(element) {
  return ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE"].includes(element.tagName);
}

function normalizePreviewText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

/*
  Проверяет, есть ли у заметки нужный тег.
*/
function noteHasTag(note, tagName) {
  return note.tags.includes(tagName);
}

/*
  Возвращает первый тег заметки.
*/
function getFirstTag(note) {
  return note.tags[0] || "";
}

/*
  Приводит старые теги к новым названиям.
*/
function normalizeTagNames(tags) {
  const tagAliases = {
    important: "work",
    study: "ideas"
  };
 
  if (!Array.isArray(tags)) return [];
 
  const normalizedTags = tags
    .map((tag) => tagAliases[tag] || tag)
    .filter((tag) => tagOrder.includes(tag));
 
  return [...new Set(normalizedTags)].slice(0, 1);
}

/*
  Очищает текст от переносов строк и лишних пробелов.
*/
function normalizeText(text) {
  return text.toLowerCase().replace(/\s+/g, " ").trim();
}

/*
  Проверяет, является ли заметка маркированным списком.
  Это нужно для правила: в папке Notes показываются только такие заметки.
*/
function isBulletNote(note) {
  const body = note.body || "";

  return (
    body.includes("<ul") ||
    body.includes("<li") ||
    body.includes("\n•") ||
    body.includes("\n- ")
  );
}

/*
  Убирает HTML-теги и возвращает обычный текст.
  Например: "<b>Привет</b>" -> "Привет".
*/
function stripHTML(html) {
  const tempElement = document.createElement("div");

  tempElement.innerHTML = html;

  return tempElement.textContent || tempElement.innerText || "";
}

/*
  Превращает обычный текст в простой HTML.
  Используется для старых заметок, которые могли сохраниться до изменения редактора.
*/
function plainTextToHTML(text) {
  const lines = String(text).split("\n");
  const htmlLines = [];
  let listItems = [];

  function closeList() {
    if (listItems.length > 0) {
      htmlLines.push("<ul>" + listItems.join("") + "</ul>");
      listItems = [];
    }
  }

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("• ")) {
      listItems.push("<li>" + escapeHTML(trimmedLine.slice(2)) + "</li>");
      return;
    }

    if (trimmedLine.startsWith("- ")) {
      listItems.push("<li>" + escapeHTML(trimmedLine.slice(2)) + "</li>");
      return;
    }

    closeList();

    if (trimmedLine) {
      htmlLines.push("<p>" + escapeHTML(trimmedLine) + "</p>");
    }
  });

  closeList();

  return htmlLines.join("");
}