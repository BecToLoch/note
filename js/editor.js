/* =========================================================
   Работа с редактором заметки
   ========================================================= */

let savedBodyEditorSelection = null;

function saveBodyEditorSelection(bodyEditor) {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);

  if (bodyEditor.contains(range.commonAncestorContainer) || range.commonAncestorContainer === bodyEditor) {
    savedBodyEditorSelection = range.cloneRange();
  }
}

function restoreBodyEditorSelection() {
  const selection = window.getSelection();

  if (!selection || !savedBodyEditorSelection) return;

  try {
    selection.removeAllRanges();
    selection.addRange(savedBodyEditorSelection);
  } catch (error) {
    savedBodyEditorSelection = null;
  }
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