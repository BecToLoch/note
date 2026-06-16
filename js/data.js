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
    tags: ["study"],
    updatedAt: new Date("2026-06-03T19:00:00").getTime(),
    deletedAt: null
  }
];

const tagDefinitions = {
  important: {
    label: "Важно",
    color: "#ff453a"
  },
  personal: {
    label: "Личное",
    color: "#0a84ff"
  },
  study: {
    label: "Учеба",
    color: "#30d158"
  },
  work: {
    label: "Работа",
    color: "#64d2ff"
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
  const text = stripHTML(note.body).trim();

  if (!text) {
    return "No additional text";
  }

  return text.slice(0, 90);
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
    recipe: "recipe",
    travel: "travel",
    reading: "reading",
    home: "home",
    ideas: "ideas",
    finance: "finance"
  };
  const legacyTagNames = ["recipe", "travel", "reading", "home", "work", "ideas", "finance"];
 
  if (!Array.isArray(tags)) return [];
 
  const normalizedTags = tags
    .map((tag) => tagAliases[tag] || tag)
    .filter((tag) => tagOrder.includes(tag) || legacyTagNames.includes(tag));
 
  return [...new Set(normalizedTags)];
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