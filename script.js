/**
 * script.js — главный файл с логикой меню кафе *
 * Что делает:
 * 1. Загружает данные из menu.json
 * 2. Отображает карточки блюд
 * 3. Фильтрует по категориям
 * 4. Управляет корзиной (добавление/удаление)
 * 5. Переключает тёмную/светлую тему
 */

 // ====== СОСТОЯНИЕ ПРИЛОЖЕНИЯ ======
import { renderMenu, renderCart } from './ui.js';

 /** Все блюда, загруженные из JSON */
let menuItems = [];

/** Текущая выбранная категория */
let currentCategory = 'all';

/** Корзина: { id: количество } */
let cart = {};
let lastClearedCart = null; // хранит последний очищенный набор

// ====== DOM-ЭЛЕМЕНТЫ ======

const menuGrid = document.getElementById('menuGrid');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartClearBtn = document.getElementById('cartClear');
const cartBadge = document.getElementById('cartBadge');

/* Показ/скрытие формы оформления заказа при клике на плавающую кнопку */
const cartFab = document.getElementById('cartFab');
const orderOverlay = document.getElementById('orderFormOverlay');
/* Ensure overlay is hidden on load */
if (orderOverlay) orderOverlay.style.display = 'none';
if (cartFab) {
  cartFab.addEventListener('click', () => {
    if (orderOverlay) {
      const isHidden = orderOverlay.style.display === 'none' || !orderOverlay.style.display;
      orderOverlay.style.display = isHidden ? 'block' : 'none';
      document.body.classList.toggle('cart-open', isHidden);
    }
  });
}

/* Close button functionality */
const orderCloseBtn = document.getElementById('orderClose');
if (orderCloseBtn) {
  orderCloseBtn.addEventListener('click', () => {
    if (orderOverlay) {
      orderOverlay.style.display = 'none';
      document.body.classList.remove('cart-open');
    }
  });
}

/* Clear cart button in overlay */
const orderClearBtn = document.getElementById('orderClear');
if (orderClearBtn) {
  orderClearBtn.addEventListener('click', () => {
    clearCart();
    if (orderOverlay) {
      orderOverlay.style.display = 'none';
      document.body.classList.remove('cart-open');
    }
  });
}
if (orderClearBtn) {
  orderClearBtn.addEventListener('click', () => {
    clearCart();
    if (orderOverlay) {
      orderOverlay.style.display = 'none';
      document.body.classList.remove('cart-open');
    }
  });
}

/* Submit order button */
const orderSubmitBtn = document.getElementById('orderSubmit');
if (orderSubmitBtn) {
orderSubmitBtn.addEventListener('click', (e) => {
    e.preventDefault();
    // If cart is empty, show error
    if (Object.keys(cart).length === 0) {
      alert('В корзине нет товаров');
      return;
    }
    const orderFormOverlay2 = document.getElementById('orderFormOverlay2');
    if (orderFormOverlay2) {
      orderFormOverlay2.style.display = 'block';
      document.body.classList.add('cart-open');
    }
  });
}

// Очистка корзины (handled via UI, listener removed)
if (cartClearBtn) {
  cartClearBtn.addEventListener('click', clearCart);
}

// Checkout button открывает форму оформления заказа
const cartCheckoutBtn = document.getElementById('cartCheckout');
if (cartCheckoutBtn) {
  cartCheckoutBtn.addEventListener('click', () => {
    if (orderOverlay) orderOverlay.style.display = 'block';
  });
}

/* Ensure order form submit also closes its overlay */
if (orderForm) {
  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Заказ оформлен! Спасибо.');
    clearCart();
    // Close both overlays
    if (orderOverlay) orderOverlay.style.display = 'none';
    if (orderFormOverlay2) orderFormOverlay2.style.display = 'none';
    // Remove blur
    document.body.classList.remove('cart-open');
  });
}

/* Cancel button in order form overlay */
const orderCancelBtn = document.getElementById('orderCancel');
if (orderCancelBtn) {
  orderCancelBtn.addEventListener('click', () => {
    if (orderFormOverlay2) {
      orderFormOverlay2.style.display = 'none';
      document.body.classList.remove('cart-open');
    }
  });
}

/* UI elements */
const themeToggle = document.getElementById('themeToggle');
const filterBtns = document.querySelectorAll('.filter-btn');

// ====== ЗАГРУЗКА ДАННЫХ ======

/** Загружает меню из menu.json и запускает отрисовку */
async function loadMenu() {
  try {
    const response = await fetch('menu.json');
    menuItems = await response.json();
    renderMenu(menuItems, currentCategory, menuGrid, createCardHTML);
    renderCart(cart, menuItems, cartItemsContainer, cartTotal, cartBadge);
  } catch (error) {
    console.error('Ошибка загрузки меню:', error);
    menuGrid.innerHTML = '<p style="color:red;">Не удалось загрузить меню. Проверьте файл menu.json</p>';
  }
}

// ====== ОТРИСОВКА МЕНЮ ======

function createCardHTML(item) {
  const inCart = cart[item.id] ? true : false;
  const count = cart[item.id] || 0;
  const buttonHTML = inCart
    ? `<div class="quantity-controls" data-id="${item.id}">
         <button class="cart-item__btn" onclick="window.removeOneFromCart(${item.id})">−</button>
         <span class="cart-item__count">${count}</span>
         <button class="cart-item__btn" onclick="window.addToCart(${item.id})">+</button>
       </div>`
    : `<button class="card__add" data-id="${item.id}">В корзину</button>`;
  return `
    <div class="card">
      <img class="card__image" src="${item.image}" alt="${item.name}" loading="lazy">
      <div class="card__body">
        <h3 class="card__name">${item.name}</h3>
        <p class="card__description">${item.description}</p>
        <div class="card__footer">
          <span class="card__price">${item.price} ₽</span>
          ${buttonHTML}
        </div>
      </div>
    </div>
  `;
}

// ---------- Добавление в корзину ----------
window.addToCart = function(id) {
  id = Number(id);
  cart[id] = (cart[id] || 0) + 1;
  renderCart(cart, menuItems, cartItemsContainer, cartTotal, cartBadge);
  renderMenu(menuItems, currentCategory, menuGrid, createCardHTML);
};

// ---------- Удаление одного товара из корзины ----------
window.removeOneFromCart = function(id) {
  id = Number(id);
  if (cart[id]) {
    cart[id]--;
    if (cart[id] <= 0) delete cart[id];
    renderCart(cart, menuItems, cartItemsContainer, cartTotal, cartBadge);
    renderMenu(menuItems, currentCategory, menuGrid, createCardHTML);
  }
};

// ---------- Очистка корзины ----------
function clearCart() {
  cart = {};
  renderCart(cart, menuItems, cartItemsContainer, cartTotal, cartBadge);
  renderMenu(menuItems, currentCategory, menuGrid, createCardHTML);
}

// ---------- Переключение темы ----------
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    // переключаем визуальное состояние кнопки
    if (isDark) {
      themeToggle.classList.add('active');
    } else {
      themeToggle.classList.remove('active');
    }
  });
}

// ---------- Фильтрация по категориям ----------
filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    currentCategory = category || 'all';
    // обновляем активный стиль кнопки
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderMenu(menuItems, currentCategory, menuGrid, createCardHTML);
  });
});

// ---------- Инициализация ----------
loadMenu();