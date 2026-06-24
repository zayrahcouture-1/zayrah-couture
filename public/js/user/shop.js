(function () {
  "use strict";

  const shopPage = document.querySelector(".shop-page");
  const cards = Array.from(document.querySelectorAll("[data-product-card]"));
  const filterForms = Array.from(document.querySelectorAll("[data-filter-form]"));
  const countEl = document.getElementById("productCount");
  const sortSelect = document.getElementById("sortProducts");
  const grid = document.getElementById("productGrid");
  const pagination = document.getElementById("shopPagination");
  const emptyState = document.getElementById("emptyState");
  const filterBadges = document.querySelectorAll("[data-filter-count]");
  const itemsPerPage = 12;

  let currentPage = 1;
  let filteredCards = cards.slice();
  let loadingTimer = null;

  const currency = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  function getState() {
    const activeForm =
      document.querySelector(".shop-filter-offcanvas.show [data-filter-form]") ||
      document.querySelector(".shop-sidebar [data-filter-form]") ||
      filterForms[0];

    return {
      search: activeForm?.querySelector("[data-search-filter]")?.value.trim().toLowerCase() || "",
      categories: getCheckedValues("[data-category-filter]"),
      stock: getCheckedValues("[data-stock-filter]"),
      price: Number(activeForm?.querySelector("[data-price-filter]")?.value || 20000),
      featured: Array.from(document.querySelectorAll("[data-featured-filter]")).some((input) => input.checked),
    };
  }

  function getCheckedValues(selector) {
    return Array.from(
      new Set(
        Array.from(document.querySelectorAll(selector + ":checked")).map((input) =>
          input.value.toLowerCase()
        )
      )
    );
  }

  function syncControl(source) {
    if (!source) return;

    const selector = getControlSelector(source);
    if (!selector) return;

    document.querySelectorAll(selector).forEach((control) => {
      if (control === source) return;
      if (control.type === "checkbox") {
        control.checked = source.checked;
      } else {
        control.value = source.value;
      }
    });

    if (source.matches("[data-price-filter]")) {
      updatePriceLabels(source.value);
    }
  }

  function getControlSelector(control) {
    if (control.matches("[data-search-filter]")) return "[data-search-filter]";
    if (control.matches("[data-price-filter]")) return "[data-price-filter]";
    if (control.matches("[data-featured-filter]")) return "[data-featured-filter]";
    if (control.matches("[data-category-filter]")) {
      return '[data-category-filter][value="' + cssEscape(control.value) + '"]';
    }
    if (control.matches("[data-stock-filter]")) {
      return '[data-stock-filter][value="' + cssEscape(control.value) + '"]';
    }
    return "";
  }

  function cssEscape(value) {
    if (window.CSS && CSS.escape) return CSS.escape(value);
    return String(value).replace(/"/g, '\\"');
  }

  function updatePriceLabels(value) {
    document.querySelectorAll("[data-price-output]").forEach((label) => {
      label.textContent = currency.format(Number(value || 0));
    });
  }

  function applyFilters(options) {
    const resetPage = !options || options.resetPage !== false;
    if (resetPage) currentPage = 1;

    showLoading();

    window.clearTimeout(loadingTimer);
    loadingTimer = window.setTimeout(() => {
      const state = getState();
      filteredCards = cards.filter((card) => matchesState(card, state));
      sortCards();
      renderPage();
      updateFilterCount(state);
      hideLoading();
    }, 180);
  }

  function matchesState(card, state) {
    const name = card.dataset.name.toLowerCase();
    const category = card.dataset.category.toLowerCase();
    const price = Number(card.dataset.price || 0);
    const featured = card.dataset.featured === "true";
    const stock = card.dataset.stock;

    if (state.search && !name.includes(state.search) && !category.includes(state.search)) return false;
    if (state.categories.length && !state.categories.includes(category)) return false;
    if (state.stock.length && !state.stock.includes(stock)) return false;
    if (state.featured && !featured) return false;
    return price <= state.price;
  }

  function sortCards() {
    const sortValue = sortSelect?.value || "newest";
    const collator = new Intl.Collator("en", { sensitivity: "base" });

    filteredCards.sort((a, b) => {
      const aName = a.dataset.name;
      const bName = b.dataset.name;
      const aPrice = Number(a.dataset.price || 0);
      const bPrice = Number(b.dataset.price || 0);
      const aDate = new Date(a.dataset.created || 0).getTime() || 0;
      const bDate = new Date(b.dataset.created || 0).getTime() || 0;

      if (sortValue === "oldest") return aDate - bDate;
      if (sortValue === "price-asc") return aPrice - bPrice;
      if (sortValue === "price-desc") return bPrice - aPrice;
      if (sortValue === "az") return collator.compare(aName, bName);
      if (sortValue === "za") return collator.compare(bName, aName);
      return bDate - aDate;
    });
  }

  function renderPage() {
    const total = filteredCards.length;
    const pageCount = Math.max(1, Math.ceil(total / itemsPerPage));
    currentPage = Math.min(currentPage, pageCount);

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const visible = new Set(filteredCards.slice(start, end));

    cards.forEach((card) => {
      card.hidden = !visible.has(card);
    });

    filteredCards.forEach((card) => grid?.appendChild(card));

    if (emptyState) emptyState.hidden = total !== 0;
    if (grid) grid.hidden = total === 0;

    updateCount(total, start, Math.min(end, total));
    renderPagination(pageCount);
  }

  function updateCount(total, start, end) {
    if (!countEl) return;
    if (total === 0) {
      countEl.textContent = "Showing 0 products";
      return;
    }
    countEl.textContent = "Showing " + (start + 1) + "-" + end + " of " + total + " products";
  }

  function renderPagination(pageCount) {
    if (!pagination) return;
    pagination.innerHTML = "";
    if (filteredCards.length === 0) return;

    pagination.appendChild(createPageButton("Previous", currentPage - 1, currentPage === 1));

    for (let page = 1; page <= pageCount; page += 1) {
      const button = createPageButton(String(page), page, false);
      button.classList.toggle("is-active", page === currentPage);
      button.setAttribute("aria-current", page === currentPage ? "page" : "false");
      pagination.appendChild(button);
    }

    pagination.appendChild(createPageButton("Next", currentPage + 1, currentPage === pageCount));
  }

  function createPageButton(label, page, disabled) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener("click", () => {
      currentPage = page;
      applyFilters({ resetPage: false });
      document.getElementById("productGrid")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return button;
  }

  function updateFilterCount(state) {
    let count = 0;
    if (state.search) count += 1;
    count += state.categories.length;
    count += state.stock.length;
    if (state.price < 20000) count += 1;
    if (state.featured) count += 1;

    filterBadges.forEach((badge) => {
      badge.textContent = count;
      badge.hidden = count === 0;
    });
  }

  function clearFilters() {
    filterForms.forEach((form) => {
      form.reset();
      form.querySelectorAll("[data-price-filter]").forEach((range) => {
        range.value = 20000;
      });
    });
    updatePriceLabels(20000);
    applyFilters();
  }

  function showLoading() {
    shopPage?.classList.add("is-loading");
  }

  function hideLoading() {
    shopPage?.classList.remove("is-loading");
  }

  function initFilters() {
    filterForms.forEach((form) => {
      form.addEventListener("input", (event) => {
        syncControl(event.target);
        applyFilters();
      });

      form.addEventListener("change", (event) => {
        syncControl(event.target);
        applyFilters();
      });
    });

    document.querySelectorAll("[data-clear-filters]").forEach((button) => {
      button.addEventListener("click", clearFilters);
    });

    sortSelect?.addEventListener("change", () => applyFilters());
    updatePriceLabels(20000);
  }

  function initWishlist() {
    document.querySelectorAll(".shop-wishlist").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        button.classList.toggle("is-active");
        const icon = button.querySelector("i");
        icon?.classList.toggle("fa-regular");
        icon?.classList.toggle("fa-solid");
      });
    });
  }

  function initQuickView() {
    document.querySelectorAll(".shop-quick-view").forEach((button) => {
      button.addEventListener("click", () => {
        const card = button.closest("[data-product-card]");
        if (!card) return;
        button.textContent = "Added to view";
        window.setTimeout(() => {
          button.textContent = "Quick View";
        }, 1200);
      });
    });
  }

  function initRecentlyViewed() {
    if (!window.Swiper || !document.querySelector(".recently-viewed-slider")) return;

    new Swiper(".recently-viewed-slider", {
      slidesPerView: 2.1,
      spaceBetween: 16,
      navigation: {
        nextEl: ".recently-viewed__btn--next",
        prevEl: ".recently-viewed__btn--prev",
      },
      breakpoints: {
        576: { slidesPerView: 2.6, spaceBetween: 18 },
        768: { slidesPerView: 3.2, spaceBetween: 20 },
        992: { slidesPerView: 4.2, spaceBetween: 22 },
        1200: { slidesPerView: 5, spaceBetween: 24 },
      },
    });
  }

  function initNewsletter() {
    const form = document.getElementById("shopNewsletterForm");
    const email = document.getElementById("shopNewsletterEmail");
    const message = document.getElementById("shopNewsletterMessage");

    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      if (!email?.checkValidity()) {
        message.textContent = "Please enter a valid email address.";
        message.style.color = "#8a4b2f";
        email?.focus();
        return;
      }
      message.textContent = "Thank you for joining Zayrah Couture.";
      message.style.color = "#2F4F3E";
      form.reset();
    });
  }

  initFilters();
  initWishlist();
  initQuickView();
  initRecentlyViewed();
  initNewsletter();
  applyFilters();
})();
