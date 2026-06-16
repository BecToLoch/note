/* =========================================================
   Начальные данные и общие функции
   ========================================================= */

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

function formatDate(timestamp) {
  const date = new Date(timestamp);

  return `${date.toLocaleString("en-US", { month: "short" })} ${date.getDate()}`;
}

function getNotePreview(note) {
  const text = getFirstTextLine(note.body);

  return text || "No additional text";
}

function getFirstTextLine(html) {
  const tempElement = document.createElement("div");

  tempElement.innerHTML = String(html || "").replace(/<br\s*\/?>/gi, "\n");

  return getFirstBlockText(tempElement);
}

function getFirstBlockText(element) {
  const blockChild = Array.from(element.children).find(isBlockElement);

  if (blockChild) {
    return getFirstBlockText(blockChild);
  }

  return normalizePreviewText(element.textContent).split("\n")[0] || "";
}

function isBlockElement(element) {
  return ["DIV", "P", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "BLOCKQUOTE"].includes(element.tagName);
}

function normalizePreviewText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function normalizeTagNames(tags) {
  const tagAliases = {
    important: "work",
    study: "ideas"
  };

  if (!Array.isArray(tags)) return [];

  return [...new Set(
    tags
      .map((tag) => tagAliases[tag] || tag)
      .filter((tag) => tagOrder.includes(tag))
  )].slice(0, 1);
}

function normalizeText(text) {
  return String(text || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function plainTextToHTML(text) {
  const htmlLines = [];
  const listItems = [];

  function closeList() {
    if (listItems.length > 0) {
      htmlLines.push("<ul>" + listItems.join("") + "</ul>");
      listItems.length = 0;
    }
  }

  String(text).split("\n").forEach((line) => {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("• ") || trimmedLine.startsWith("- ")) {
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