// Хранение состояния приложения.
// Здесь лежит только загрузка/сохранение данных и выбранный цвет новой папки.
import { STORAGE_KEY, getDefaultState } from "./config.js";

export let state = loadState();
export let selectedColor = "#f5c542";

export function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return getDefaultState();

  try {
    const parsed = JSON.parse(saved);
    const defaults = getDefaultState();

    return {
      ...defaults,
      ...parsed,
      notes: parsed.notes || defaults.notes,
      folders: parsed.folders || defaults.folders,
      settings: parsed.settings || defaults.settings
    };
  } catch (error) {
    return getDefaultState();
  }
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}