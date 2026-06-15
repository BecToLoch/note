// Точка входа приложения.
// Здесь запускается первая отрисовка и подключаются обработчики событий.
import { bindEvents } from "./events.js";
import { renderAll } from "./render.js";

export function initApp() {
  renderAll();
  bindEvents();
}