// Базовые настройки приложения.
export const STORAGE_KEY = "notes-app-v1";

export const DEFAULT_FOLDER_IDS = ["notes", "ideas", "work"];

export const TAG_LABELS = {
  important: "Важно",
  idea: "Идея",
  personal: "Личное",
  learning: "Учёба",
  plans: "Планы"
};

// Начальные заметки. Они показываются, если у пользователя ещё нет своих данных.
export function getDefaultState() {
  const now = Date.now();

  return {
    notes: [
      {
        id: "note-1",
        title: "Идеи для проекта",
        folder: "ideas",
        tags: ["important", "idea", "plans"],
        createdAt: now - 1000 * 60 * 60 * 24 * 3,
        updatedAt: now - 1000 * 60 * 60 * 2,
        deletedAt: null,
        locked: false,
        body: `
          <p>Веб-приложение для планирования задач с фокусом на простоту и минимализм.</p>
          <h3>Основные функции:</h3>
          <ul>
            <li>Создание и управление задачами</li>
            <li>Проекты и категории</li>
            <li>Календарь и напоминания</li>
            <li>Статистика продуктивности</li>
            <li>Тёмная тема 🌙</li>
          </ul>
          <h3>Следующие шаги:</h3>
          <ul>
            <li>Исследование конкурентов</li>
            <li>Прототип интерфейса</li>
            <li>Планирование базы данных</li>
            <li>Выбор стека технологий</li>
          </ul>
        `
      },
      {
        id: "note-2",
        title: "План на неделю",
        folder: "work",
        tags: ["plans"],
        createdAt: now - 1000 * 60 * 60 * 24 * 2,
        updatedAt: now - 1000 * 60 * 60 * 24,
        deletedAt: null,
        locked: false,
        body: `
          <p><b>Понедельник:</b> разобрать задачи проекта.</p>
          <p><b>Вторник:</b> подготовить прототип.</p>
          <p><b>Среда:</b> проверить интерфейс на мобильных устройствах.</p>
        `
      },
      {
        id: "note-3",
        title: "Книги к прочтению",
        folder: "notes",
        tags: ["personal"],
        createdAt: now - 1000 * 60 * 60 * 24 * 6,
        updatedAt: now - 1000 * 60 * 60 * 24 * 4,
        deletedAt: null,
        locked: false,
        body: `
          <p>Список книг, которые стоит прочитать в этом месяце:</p>
          <ul>
            <li>«Джедайские техники»</li>
            <li>«Поток»</li>
            <li>«Думай медленно... решай быстро»</li>
          </ul>
        `
      }
    ],
    folders: [
      { id: "notes", name: "Заметки", color: "#f5c542" },
      { id: "ideas", name: "Идеи", color: "#0a84ff" },
      { id: "work", name: "Работа", color: "#30d158" }
    ],
    settings: {
      launch: true,
      updates: true,
      cloud: true
    },
    selectedFolder: "all",
    selectedTag: null,
    selectedNoteId: "note-1",
    password: "123456"
  };
}