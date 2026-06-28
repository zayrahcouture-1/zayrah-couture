(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {
    initGallery();
    initTabs();
    initAccordion();
    initVariants();
    initWhatsAppOrder();
    initShare();
  });

  // Handle image gallery switching
  function initGallery() {
    const mainImg = document.getElementById("mainProductImg");
    const thumbBtns = document.querySelectorAll(".thumb-btn");

    if (!mainImg || !thumbBtns.length) return;

    thumbBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        // Remove active state from all thumbnails
        thumbBtns.forEach((b) => b.classList.remove("active"));
        
        // Add active state to clicked thumbnail
        btn.classList.add("active");
        
        // Update main image src
        const newUrl = btn.getAttribute("data-img-url");
        if (newUrl) {
          mainImg.style.opacity = 0.3;
          setTimeout(() => {
            mainImg.src = newUrl;
            mainImg.style.opacity = 1;
          }, 150);
        }
      });
    });
  }

  // Handle detailed page tab switching
  function initTabs() {
    const triggers = document.querySelectorAll(".tab-trigger");
    const panels = document.querySelectorAll(".tab-panel");

    if (!triggers.length || !panels.length) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener("click", () => {
        // Deactivate all triggers
        triggers.forEach((t) => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });

        // Deactivate all panels
        panels.forEach((p) => p.classList.remove("active"));

        // Activate clicked trigger
        trigger.classList.add("active");
        trigger.setAttribute("aria-selected", "true");

        // Activate corresponding panel
        const controlId = trigger.getAttribute("aria-controls");
        const activePanel = document.getElementById(controlId);
        if (activePanel) {
          activePanel.classList.add("active");
        }
      });
    });
  }

  // Handle mobile accordion toggle (FAQ-style)
  function initAccordion() {
    const headers = document.querySelectorAll(".accordion-header");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        const isExpanded = header.getAttribute("aria-expanded") === "true";
        const controlId = header.getAttribute("aria-controls");
        const collapseEl = document.getElementById(controlId);
        
        // Toggle attribute
        header.setAttribute("aria-expanded", !isExpanded);
        
        // Toggle collapse show state
        if (collapseEl) {
          collapseEl.classList.toggle("show");
        }
      });
    });
  }

  // Handle dynamic variants selection
  function initVariants() {
    const variantBtns = document.querySelectorAll(".variant-btn");
    const selectedVariantsInput = document.getElementById("selectedVariantsInput");
    const variantGroups = document.querySelectorAll(".variant-select-group");
    
    if (!variantBtns.length) return;

    const selections = {};

    variantBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const variantName = btn.getAttribute("data-variant");
        const optionVal = btn.getAttribute("data-option");

        const group = btn.closest(".variant-select-group");
        const siblings = group.querySelectorAll(".variant-btn");
        siblings.forEach((sib) => {
          sib.classList.remove("active");
          sib.style.borderColor = "rgba(200, 213, 192, 0.4)";
          sib.style.backgroundColor = "transparent";
          sib.style.color = "var(--text-muted)";
        });

        btn.classList.add("active");
        btn.style.borderColor = "var(--primary)";
        btn.style.backgroundColor = "var(--primary)";
        btn.style.color = "var(--white)";

        selections[variantName] = optionVal;

        if (selectedVariantsInput) {
          selectedVariantsInput.value = JSON.stringify(selections);
        }

        const variantError = document.getElementById("variantSelectionError");
        if (variantError) {
          variantError.style.display = "none";
        }

        // Match selections to combinations
        updatePriceBasedOnSelection(selections, variantGroups.length);
      });
    });
  }

  function formatMoney(val) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(Number(val || 0));
  }

  function updatePriceBasedOnSelection(selections, totalGroups) {
    const priceContainer = document.querySelector(".product-price-container");
    if (!priceContainer) return;

    const selectedCount = Object.keys(selections).length;
    if (selectedCount < totalGroups) {
      renderPriceHTML(baseProductPrice, baseProductDiscountPrice, priceContainer);
      return;
    }

    if (typeof productCombinationsData === 'undefined' || !productCombinationsData.length) {
      renderPriceHTML(baseProductPrice, baseProductDiscountPrice, priceContainer);
      return;
    }

    const matched = productCombinationsData.find(c => {
      const keys = Object.keys(c.attributes || {});
      const selKeys = Object.keys(selections);
      if (keys.length !== selKeys.length) return false;
      return selKeys.every(k => c.attributes[k] === selections[k]);
    });

    if (matched) {
      renderPriceHTML(matched.price, matched.discountPrice, priceContainer);
    } else {
      renderPriceHTML(baseProductPrice, baseProductDiscountPrice, priceContainer);
    }
  }

  function renderPriceHTML(price, discountPrice, container) {
    if (discountPrice && Number(discountPrice) > 0) {
      container.innerHTML = `
        <span class="price-sale">${formatMoney(discountPrice)}</span>
        <span class="price-was">${formatMoney(price)}</span>
      `;
    } else {
      container.innerHTML = `
        <span class="price-regular">${formatMoney(price)}</span>
      `;
    }
  }

  // Handle WhatsApp Order redirection with variants validation
  function initWhatsAppOrder() {
    const orderBtn = document.querySelector(".btn-order-whatsapp");
    const selectedVariantsInput = document.getElementById("selectedVariantsInput");
    const variantGroups = document.querySelectorAll(".variant-select-group");

    if (orderBtn) {
      orderBtn.addEventListener("click", (e) => {
        e.preventDefault();

        let selectedCount = 0;
        let selections = {};
        if (selectedVariantsInput && selectedVariantsInput.value) {
          try {
            selections = JSON.parse(selectedVariantsInput.value);
            selectedCount = Object.keys(selections).length;
          } catch (err) {
            selectedCount = 0;
          }
        }

        if (variantGroups.length > 0 && selectedCount < variantGroups.length) {
          const variantError = document.getElementById("variantSelectionError");
          if (variantError) {
            variantError.style.display = "block";
          }
          return;
        }

        const productSlug = window.location.pathname.split("/").pop();
        const checkoutUrl = `/checkout?slug=${encodeURIComponent(productSlug)}&variants=${encodeURIComponent(JSON.stringify(selections))}`;
        window.location.href = checkoutUrl;
      });
    }
  }

  // Handle Product Share Actions
  function initShare() {
    const btnShareCopy = document.getElementById("btnShareCopy");
    const btnShareWhatsApp = document.getElementById("btnShareWhatsApp");
    const btnShareNative = document.getElementById("btnShareNative");
    const copyFeedback = document.getElementById("shareCopyFeedback");

    const shareUrl = typeof productShareUrl !== "undefined" ? productShareUrl : window.location.href;
    const productName = typeof productNameStr !== "undefined" ? productNameStr : "Zayrah Couture Product";

    // 1. Copy Link Action
    if (btnShareCopy) {
      btnShareCopy.addEventListener("click", () => {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            if (copyFeedback) {
              copyFeedback.style.display = "block";
              setTimeout(() => {
                copyFeedback.style.display = "none";
              }, 2000);
            }
          })
          .catch((err) => {
            console.error("Failed to copy link:", err);
          });
      });
    }

    // 2. Share on WhatsApp Action
    if (btnShareWhatsApp) {
      btnShareWhatsApp.addEventListener("click", () => {
        const text = `Check out ${productName}: ${shareUrl}`;
        const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
        window.open(whatsappShareUrl, "_blank");
      });
    }

    // 3. Native Share Action (Mobile API detection)
    if (btnShareNative && navigator.share) {
      btnShareNative.style.display = "inline-flex";
      
      btnShareNative.addEventListener("click", () => {
        navigator.share({
          title: productName,
          text: `Check out ${productName} on Zayrah Couture`,
          url: shareUrl
        })
        .catch((err) => {
          console.log("Native share failed or dismissed:", err);
        });
      });
    }
  }
})();
