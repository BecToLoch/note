// Обработчики событий: клики, ввод текста, горячие клавиши.
import { state, selectedColor, saveState } from "./state.js";
import { $, closeAllModals, openModal } from "./utils.js";
import {
  applyCommand,
  copyShareLink,
  createFolderFromModal,
  createNoteFromModal,
  deleteSelectedNote,
  downloadExport,
  handleLockButton,
  saveCurrentEditor,
  savePassword,
  saveSettings,
  searchInNote,
  unlockSelectedNote
} from "./actions.js";
import { renderAll } from "./render.js";

export function bindEvents() {
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

export function handleKeyboard(event) {
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

export function isTyping() {
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