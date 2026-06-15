// Небольшие вспомогательные функции, которые используются в разных частях проекта.
import { TAG_LABELS } from "./config.js";

export const $ = (id) => document.getElementById(id);

export function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function plainText(html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  return element.textContent || element.innerText || "";
}

export function escapeHTML(value) {
  const map = {
    "&": "\u0026amp;",
    "<": "\u0026lt;",
    ">": "\u0026gt;",
    '"': "\u0026quot;",
    "'": "\u0026#039;"
  };

  return String(value).replace(/[&<>"']/g, (char) => map[char]);
}

export function escapeAttribute(value) {
  return escapeHTML(value).replaceAll("`", "&#096;");
}

export function safeFilename(value) {
  return value.replace(/[^\wа-яА-ЯёЁ-]+/g, "_").slice(0, 40) || "note";
}

export function openModal(id) {
  const backdrop = $("modalBackdrop");
  const modal = $(id);

  if (!backdrop || !modal) return;

  backdrop.classList.remove("hidden");
  modal.classList.remove("hidden");

  const firstInput = modal.querySelector("input, textarea, select, button");
  if (firstInput) firstInput.focus();
}

export function closeAllModals() {
  const backdrop = $("modalBackdrop");

  if (backdrop) backdrop.classList.add("hidden");

  document.querySelectorAll(".modal-card").forEach((modal) => modal.classList.add("hidden"));
}

export function tagLabel(tag) {
  return TAG_LABELS[tag] || tag;
}

export function getFolderName(folders, folderId) {
  const folder = folders.find((item) => item.id === folderId);
  return folder ? folder.name : "Заметки";
}

export function defaultFolderId(selectedFolder) {
  if (selectedFolder && selectedFolder !== "all" && selectedFolder !== "trash") {
    return selectedFolder;
  }

  return "notes";
}

export function formatShortDate(timestamp) {
  return new Date(timestamp).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "short"
  });
}

export function formatFullDate(timestamp) {
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

export function isSameDay(first, second) {
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function getSectionName(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (isSameDay(date, today)) return "Сегодня";
  if (isSameDay(date, yesterday)) return "Вчера";

  return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
}