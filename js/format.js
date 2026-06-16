/* =========================================================
   Форматирование текста заметки
   ========================================================= */

function applyFormat(formatType, bodyEditor) {
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
  return replaceBlockTag(block, block.tagName.toLowerCase() === "h2" ? "p" : "h2");
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