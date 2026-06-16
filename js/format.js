/* =========================================================
   Форматирование текста заметки
   ========================================================= */

function toggleFormatPopover(formatPopover) {
  if (!formatPopover) return;

  formatPopover.classList.toggle("hidden");
}

function closeFormatPopover(formatPopover) {
  if (!formatPopover) return;

  formatPopover.classList.add("hidden");
}

function applyFormat(formatType, bodyEditor, getSelectedNote, saveNotes, notes, renderSidebarCounts, renderNotesListOnly) {
  const selectedNote = getSelectedNote();

  if (!selectedNote || !bodyEditor) return;

  bodyEditor.focus();

  switch (formatType) {
    case "heading":
      document.execCommand("formatBlock", false, "H2");
      break;

    case "bold":
      document.execCommand("bold", false, null);
      break;

    case "italic":
      document.execCommand("italic", false, null);
      break;

    case "underline":
      document.execCommand("underline", false, null);
      break;

    case "strikethrough":
      document.execCommand("strikethrough", false, null);
      break;

    case "align-left":
      document.execCommand("justifyLeft", false, null);
      break;

    case "align-center":
      document.execCommand("justifyCenter", false, null);
      break;

    case "align-right":
      document.execCommand("justifyRight", false, null);
      break;

    case "bullet-list":
      document.execCommand("insertUnorderedList", false, null);
      break;

    case "numbered-list":
      document.execCommand("insertOrderedList", false, null);
      break;

    default:
      break;
  }

  updateSelectedNoteFromInputs();
  saveNotes(notes);
  renderSidebarCounts(notes);
  renderNotesListOnly();
}

function handleBodyEditorHeadingEnter(event, bodyEditor) {
  const selection = window.getSelection();

  if (!selection || !selection.anchorNode) return;

  const anchorNode = selection.anchorNode.nodeType === Node.ELEMENT_NODE
    ? selection.anchorNode
    : selection.anchorNode.parentElement;
  const isInHeading = anchorNode?.closest("h2");

  if (event.key === "Enter" && isInHeading) {
    event.preventDefault();
    document.execCommand("insertLineBreak", false, null);
  }
}
