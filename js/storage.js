/* =========================================================
   Работа с localStorage
   ========================================================= */

/*
  Ключ, по которому заметки сохраняются в браузере.
  localStorage хранит данные даже после перезагрузки страницы.
*/
const STORAGE_KEY = "photo-notes-app";

/*
  Загружает заметки из localStorage.
  Если сохраненных заметок нет, возвращает начальную заметку с изображения.
*/
function loadNotes() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);

  if (!savedNotes) {
    return initialNotes;
  }

  try {
    return JSON.parse(savedNotes).map((note) => ({
      ...note,
      tags: normalizeTagNames(note.tags)
    }));
  } catch (error) {
    /*
      Если данные повреждены, возвращаем начальные данные,
      чтобы приложение не сломалось.
    */
    return initialNotes;
  }
}

/*
  Сохраняет все заметки в localStorage.
*/
function saveNotes(notes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

/*
  Находит заметку по id.
  Если заметка не найдена, возвращает null.
*/
function findNoteById(notes, id) {
  return notes.find((note) => note.id === id) || null;
}

/*
  Создает новую заметку.
  Дата ставится текущая.
*/
function createNoteObject(folder = "Work") {
  const now = Date.now();

  return {
    id: "note-" + now,
    title: "Новая заметка",
    body: "",
    folder: folder,
    tags: [],
    updatedAt: now,
    deletedAt: null
  };
}