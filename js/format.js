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
  restoreBodyEditorSelection();
  bodyEditor.focus();
  restoreBodyEditorSelection();

  switch (formatType) {
    case "heading":
      toggleHeading(bodyEditor);
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

function toggleHeading(bodyEditor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const blocks = getHeadingBlocksForRange(bodyEditor, range);

  if (blocks.length === 0) {
    document.execCommand("formatBlock", false, "H2");
    return;
  }

  let replacementBlock = null;

  blocks.forEach((block, index) => {
    const replacedBlock = toggleHeadingBlock(block);

    if (index === 0) {
      replacementBlock = replacedBlock;
    }
  });

  placeCaretAtStart(replacementBlock);
}

function getHeadingBlocksForRange(bodyEditor, range) {
  const blocks = Array.from(bodyEditor.querySelectorAll("p,h1,h2,h3,h4,h5,h6,div,blockquote"));

  if (range.collapsed) {
    const block = getClosestHeadingBlock(bodyEditor, range.startContainer);

    return block ? [block] : [];
  }

  return blocks.filter((block) => block !== bodyEditor && rangeIntersectsElement(range, block));
}

function getClosestHeadingBlock(bodyEditor, node) {
  let element = node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement;

  while (element && element !== bodyEditor) {
    if (element.matches("p,h1,h2,h3,h4,h5,h6,div,blockquote")) {
      return element;
    }

    element = element.parentElement;
  }

  return null;
}

function rangeIntersectsElement(range, element) {
  try {
    return range.intersectsNode(element);
  } catch (error) {
    const elementRange = document.createRange();

    elementRange.selectNodeContents(element);

    const rangeEndsBeforeElement = range.compareBoundaryPoints(Range.END_TO_START, elementRange) < 0;
    const rangeStartsAfterElement = range.compareBoundaryPoints(Range.START_TO_END, elementRange) > 0;

    return !rangeEndsBeforeElement && !rangeStartsAfterElement;
  }
}

function toggleHeadingBlock(block) {
  const currentTag = block.tagName.toLowerCase();

  if (currentTag === "h2") {
    return replaceBlockTag(block, "p");
  }

  return replaceBlockTag(block, "h2");
}

function replaceBlockTag(block, newTag) {
  const parent = block.parentNode;

  if (!parent) return null;

  const newBlock = document.createElement(newTag);

  while (block.firstChild) {
    newBlock.appendChild(block.firstChild);
  }

  parent.insertBefore(newBlock, block.nextSibling);
  block.remove();

  return newBlock;
}

function placeCaretAtStart(element) {
  if (!element) return;

  const range = document.createRange();

  range.selectNodeContents(element);
  range.collapse(true);

  const selection = window.getSelection();

  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
}

function wrapDirectTextNodes(bodyEditor) {
  const selectionOffset = getBodyEditorSelectionOffset(bodyEditor);

  if (selectionOffset === null) return;

  let hasWrappedText = false;
  const childNodes = Array.from(bodyEditor.childNodes);

  childNodes.forEach((node) => {
    if (node.nodeType !== Node.TEXT_NODE || node.textContent.trim() === "") return;

    const text = node.textContent.replace(/\n/g, "");

    if (!text) {
      node.remove();
      return;
    }

    const block = document.createElement("div");
    block.appendChild(document.createTextNode(text));

    bodyEditor.insertBefore(block, node);
    node.remove();
    hasWrappedText = true;
  });

  if (hasWrappedText) {
    restoreBodyEditorSelectionByOffset(bodyEditor, selectionOffset);
  }
}

function getBodyEditorSelectionOffset(bodyEditor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return null;

  const range = selection.getRangeAt(0);

  if (!bodyEditor.contains(range.startContainer) && range.startContainer !== bodyEditor) {
    return null;
  }

  const preRange = document.createRange();
  preRange.selectNodeContents(bodyEditor);
  preRange.setEnd(range.startContainer, range.startOffset);

  return preRange.toString().length;
}

function restoreBodyEditorSelectionByOffset(bodyEditor, offset) {
  const selection = window.getSelection();

  if (!selection) return;

  const range = document.createRange();
  let currentOffset = 0;
  let restored = false;

  function walk(node) {
    if (restored) return;

    if (node.nodeType === Node.TEXT_NODE) {
      const nextOffset = currentOffset + node.textContent.length;

      if (offset <= nextOffset) {
        range.setStart(node, offset - currentOffset);
        range.collapse(true);
        restored = true;
        return;
      }

      currentOffset = nextOffset;
      return;
    }

    Array.from(node.childNodes).forEach(walk);
  }

  walk(bodyEditor);

  if (!restored) {
    range.selectNodeContents(bodyEditor);
    range.collapse(false);
  }

  selection.removeAllRanges();
  selection.addRange(range);
}

function handleBodyEditorHeadingEnter(event, bodyEditor) {
  const selection = window.getSelection();

  if (!selection || !selection.anchorNode) return;

  const anchorNode = selection.anchorNode.nodeType === Node.ELEMENT_NODE
    ? selection.anchorNode
    : selection.anchorNode.parentElement;
  const heading = anchorNode?.closest("h2");

  if (event.key === "Enter" && heading) {
    event.preventDefault();

    const paragraph = document.createElement("p");
    const lineBreak = document.createElement("br");

    paragraph.appendChild(lineBreak);
    heading.insertAdjacentElement("afterend", paragraph);
    placeCaretAtStart(paragraph);
  }
}
