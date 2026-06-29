(function () {
  "use strict";

  const siteHeader = document.getElementById("siteHeader");
  const mainNav = document.getElementById("mainNav");
  const searchToggle = document.getElementById("searchToggle");
  const searchOverlay = document.getElementById("searchOverlay");
  const searchBackdrop = document.getElementById("searchBackdrop");
  const searchClose = document.getElementById("searchClose");
  const searchInput = document.getElementById("searchInput");
  const searchResults = document.getElementById("searchResults");
  const searchForm = document.getElementById("searchForm");

  let products = [];
  let categories = [];
  let isSearchDataLoaded = false;
  let searchDataPromise = null;

  function loadSearchData() {
    if (isSearchDataLoaded) return Promise.resolve();
    if (searchDataPromise) return searchDataPromise;

    searchDataPromise = fetch("/api/search-data")
      .then((response) => {
        if (!response.ok) throw new Error("Search data request failed");
        return response.json();
      })
      .then((data) => {
        products = data.products || [];
        categories = data.categories || [];
        isSearchDataLoaded = true;
        searchDataPromise = null;
      })
      .catch((err) => {
        console.warn("API Search data unavailable, trying DOM fallback:", err);
        searchDataPromise = null;
        try {
          const productData = document.getElementById("searchData");
          const categoryData = document.getElementById("categorySearchData");
          if (productData) products = JSON.parse(productData.textContent);
          if (categoryData) categories = JSON.parse(categoryData.textContent);
        } catch (domErr) {
          console.warn("DOM Search data fallback unavailable:", domErr);
        }
      });

    return searchDataPromise;
  }

  /* ---- Sticky Navbar ---- */
  function handleScroll() {
    if (!siteHeader) return;
    siteHeader.classList.toggle("is-scrolled", window.scrollY > 60);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  /* ---- Mobile Menu ---- */
  if (mainNav && siteHeader) {
    mainNav.addEventListener("show.bs.collapse", () => {
      siteHeader.classList.add("menu-expanded");
      document.body.classList.add("menu-open");
    });

    mainNav.addEventListener("hide.bs.collapse", () => {
      siteHeader.classList.remove("menu-expanded");
      document.body.classList.remove("menu-open");
    });

    mainNav.querySelectorAll(".nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        if (window.innerWidth < 992 && mainNav.classList.contains("show")) {
          const collapse = bootstrap.Collapse.getInstance(mainNav);
          if (collapse) collapse.hide();
        }
      });
    });
  }

  /* ---- Search Overlay ---- */
  function openSearch() {
    if (!searchOverlay) return;
    loadSearchData().then(() => {
      if (searchInput && searchInput.value) {
        renderSearchResults(searchInput.value);
      }
    });
    searchOverlay.classList.add("is-open");
    searchOverlay.setAttribute("aria-hidden", "false");
    searchToggle?.setAttribute("aria-expanded", "true");
    document.body.classList.add("search-open");
    setTimeout(() => searchInput?.focus(), 150);
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove("is-open");
    searchOverlay.setAttribute("aria-hidden", "true");
    searchToggle?.setAttribute("aria-expanded", "false");
    document.body.classList.remove("search-open");
    if (searchInput) searchInput.value = "";
    renderSearchResults("");
  }

  function renderSearchResults(query) {
    if (!searchResults) return;

    const term = query.trim().toLowerCase();

    if (!term) {
      searchResults.classList.remove("has-results");
      searchResults.innerHTML = "";
      return;
    }

    const matchedProducts = products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          (p.category && p.category.toLowerCase().includes(term))
      )
      .slice(0, 6);

    if (matchedProducts.length === 0) {
      searchResults.classList.add("has-results");
      searchResults.innerHTML =
        '<p class="search-results__empty">No results found for "' +
        escapeHtml(query) +
        '"</p>';
      return;
    }

    let html = "";

    if (matchedProducts.length > 0) {
      html += '<p class="search-results__group-title">Products</p>';
      matchedProducts.forEach((product) => {
        const price = product.salePrice
          ? "₹" + Number(product.salePrice).toLocaleString('en-IN')
          : "₹" + Number(product.price).toLocaleString('en-IN');
        html +=
          '<a href="/product/' +
          encodeURIComponent(product.slug) +
          '" class="search-result-item" role="option">' +
          '<img src="' +
          escapeHtml(product.image) +
          '" alt="" class="search-result-item__img" loading="lazy" width="52" height="64" />' +
          '<span class="search-result-item__info">' +
          '<p class="search-result-item__name">' +
          escapeHtml(product.name) +
          "</p>" +
          '<p class="search-result-item__meta">' +
          escapeHtml(product.category || "Product") +
          "</p>" +
          "</span>" +
          '<span class="search-result-item__price">' +
          price +
          "</span></a>";
      });
    }

    searchResults.classList.add("has-results");
    searchResults.innerHTML = html;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  searchToggle?.addEventListener("click", openSearch);
  searchClose?.addEventListener("click", closeSearch);
  searchBackdrop?.addEventListener("click", closeSearch);

  searchInput?.addEventListener("input", (e) => {
    loadSearchData().then(() => {
      renderSearchResults(e.target.value);
    });
  });

  searchForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    loadSearchData().then(() => {
      renderSearchResults(searchInput?.value || "");
    });
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchOverlay?.classList.contains("is-open")) {
      closeSearch();
    }
  });

  /* ---- Scroll Reveal ---- */
  const revealElements = document.querySelectorAll(".reveal-up");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---- Newsletter Form ---- */
  const newsletterForm = document.getElementById("newsletterForm");
  const newsletterMessage = document.getElementById("newsletterMessage");

  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      const email = emailInput.value.trim();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newsletterMessage.textContent = "Please enter a valid email address.";
        newsletterMessage.className = "newsletter-form__note error";
        return;
      }

      newsletterMessage.textContent =
        "Thank you for subscribing! Welcome to Zayrah Couture.";
      newsletterMessage.className = "newsletter-form__note success";
      emailInput.value = "";
    });
  }

  /* ---- Smooth anchor offset for fixed header ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const targetId = anchor.getAttribute("href");
      if (targetId === "#") return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        closeSearch();
        const headerHeight = siteHeader ? siteHeader.offsetHeight : 80;
        const top =
          target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: "smooth" });
      }
    });
  });
})();
