/* ========================================
   Zayrah Couture — Edit Product (JS)
   ======================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Sidebar Toggle ---- */
  const menuBtn  = document.getElementById('menuBtn');
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('overlay');

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
  }

  menuBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('open');
    overlay?.classList.toggle('show');
  });

  overlay?.addEventListener('click', closeSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) closeSidebar();
  });


  /* ---- Manage Existing Images ---- */
  const existingGrid      = document.getElementById('existingGrid');
  const removedImagesFlag = document.getElementById('removedImagesFlag');
  
  let deletedPublicIds = [];
  let existingItems = Array.from(document.querySelectorAll('.existing-item'));
  let activeExistingCount = existingItems.length;

  existingItems.forEach(item => {
    const removeBtn = item.querySelector('.existing-item__remove');
    const publicId  = item.getAttribute('data-id');

    removeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Add to deleted array
      if (publicId) {
        deletedPublicIds.push(publicId);
        removedImagesFlag.value = deletedPublicIds.join(',');
      }

      // Hide from DOM
      item.style.display = 'none';
      activeExistingCount--;

      // Proactive count validation feedback
      const totalCount = activeExistingCount + selectedFiles.length;
      if (totalCount < 3) {
        imagesErrorMsg.textContent = `At least 3 images are required (currently ${totalCount} remaining)`;
        imagesErrorMsg.style.display = 'block';
      } else {
        imagesErrorMsg.style.display = 'none';
      }

      // If no existing images left show placeholder
      if (activeExistingCount === 0) {
        existingGrid.innerHTML = '<p class="no-existing-text">No images currently uploaded.</p>';
      }
    });
  });


  /* ---- Multiple Image Upload & Cropping (New Images) ---- */
  const uploadZone      = document.getElementById('uploadZone');
  const imageInput      = document.getElementById('imageInput');
  const uploadContent   = document.getElementById('uploadContent');
  const uploadGrid      = document.getElementById('uploadGrid');
  
  // Crop Modal elements
  const cropModalOverlay = document.getElementById('cropModalOverlay');
  const cropperImage     = document.getElementById('cropperImage');
  const cancelCropBtn    = document.getElementById('cancelCrop');
  const confirmCropBtn   = document.getElementById('confirmCrop');

  let selectedFiles = []; // Array of { id, file, croppedBlob }
  let filesToCrop = [];   // Queue of { id, file } for sequential cropping
  let cropper = null;
  let activeCropId = null;
  let activeCropIsReCrop = false;
  let activeCropFile = null;

  function renderPreviews() {
    uploadGrid.innerHTML = '';
    
    if (selectedFiles.length === 0) {
      uploadGrid.style.display = 'none';
      uploadContent.style.display = 'flex';
    } else {
      uploadGrid.style.display = 'grid';
      uploadContent.style.display = 'none';
    }

    selectedFiles.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'upload-preview-item';
      itemEl.title = 'Click image to crop/re-crop';

      // Set thumbnail URL
      const displayUrl = URL.createObjectURL(item.croppedBlob);

      itemEl.innerHTML = `
        <img src="${displayUrl}" alt="Preview" />
        <button type="button" class="upload-preview-item__btn--delete" title="Delete Image">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      `;

      // Attach Crop handler to clicking the thumbnail (for re-cropping)
      itemEl.addEventListener('click', (e) => {
        // If clicking delete button, don't open crop modal
        if (e.target.closest('.upload-preview-item__btn--delete')) return;
        openCropModal(item.id, item.file, true);
      });

      // Attach Delete handler
      itemEl.querySelector('.upload-preview-item__btn--delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImageItem(item.id);
      });

      uploadGrid.appendChild(itemEl);
    });

    // Add plus button/card if total combined images (existing + new) < 5
    if (activeExistingCount + selectedFiles.length < 5) {
      const plusEl = document.createElement('div');
      plusEl.className = 'upload-preview-item upload-preview-item--plus';
      plusEl.title = 'Add more images';
      plusEl.innerHTML = `
        <div class="upload-preview-item__plus-inner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
      `;
      plusEl.addEventListener('click', (e) => {
        e.stopPropagation();
        imageInput.click();
      });
      uploadGrid.appendChild(plusEl);
    }

    // Proactive count validation feedback
    const totalCount = activeExistingCount + selectedFiles.length;
    if (totalCount < 3) {
      imagesErrorMsg.textContent = `At least 3 images are required (currently ${totalCount} added/remaining)`;
      imagesErrorMsg.style.display = 'block';
    } else {
      imagesErrorMsg.style.display = 'none';
    }
  }

  function processNextFileToCrop() {
    if (cropModalOverlay.classList.contains('show')) return; // already cropping something
    if (filesToCrop.length === 0) return; // nothing to crop

    const next = filesToCrop[0];
    openCropModal(next.id, next.file, false);
  }

  function handleFilesSelection(files) {
    if (!files || files.length === 0) return;
    
    // Total combined image limit (existing non-deleted + newly uploaded + files in crop queue)
    if (activeExistingCount + selectedFiles.length + filesToCrop.length + files.length > 5) {
      alert('A product can have a maximum of 5 images total.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      filesToCrop.push({
        id: Date.now() + Math.random(),
        file: file
      });
    });

    imageInput.value = '';

    // Start cropping queue
    processNextFileToCrop();
  }

  function deleteImageItem(id) {
    selectedFiles = selectedFiles.filter(item => item.id !== id);
    renderPreviews();
  }

  function openCropModal(id, file, isReCrop) {
    activeCropId = id;
    activeCropIsReCrop = isReCrop;
    activeCropFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      cropperImage.src = e.target.result;
      cropModalOverlay.classList.add('show');

      if (cropper) cropper.destroy();

      cropper = new Cropper(cropperImage, {
        aspectRatio: 1,
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false
      });
    };
    reader.readAsDataURL(file);
  }

  // Click zone to browse
  uploadZone?.addEventListener('click', (e) => {
    if (e.target.closest('#uploadGrid')) return;
    imageInput?.click();
  });

  imageInput?.addEventListener('change', () => {
    if (imageInput.files) {
      handleFilesSelection(imageInput.files);
    }
  });

  function closeCropModal() {
    cropModalOverlay.classList.remove('show');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    activeCropId = null;
    activeCropIsReCrop = false;
    activeCropFile = null;
  }

  // Cancel Crop
  cancelCropBtn?.addEventListener('click', () => {
    const wasReCrop = activeCropIsReCrop;
    const cancelledId = activeCropId;

    closeCropModal();

    if (!wasReCrop) {
      // Discard this image completely from the filesToCrop queue
      filesToCrop = filesToCrop.filter(x => x.id !== cancelledId);
      // Process next file in queue
      setTimeout(() => {
        processNextFileToCrop();
      }, 150);
    }
  });

  // Confirm Crop
  confirmCropBtn?.addEventListener('click', () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 600,
      height: 600
    });

    if (!canvas) {
      closeCropModal();
      setTimeout(() => {
        processNextFileToCrop();
      }, 150);
      return;
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const wasReCrop = activeCropIsReCrop;
        const confirmedId = activeCropId;
        const confirmedFile = activeCropFile;

        if (wasReCrop) {
          // Update in selectedFiles
          const item = selectedFiles.find(x => x.id === confirmedId);
          if (item) {
            item.croppedBlob = blob;
            renderPreviews();
          }
        } else {
          // Add to selectedFiles
          selectedFiles.push({
            id: confirmedId,
            file: confirmedFile,
            croppedBlob: blob
          });
          renderPreviews();
          // Remove from filesToCrop queue
          filesToCrop = filesToCrop.filter(x => x.id !== confirmedId);
        }
      }
      
      closeCropModal();

      // Process next file in queue
      setTimeout(() => {
        processNextFileToCrop();
      }, 150);
    }, 'image/jpeg', 0.9);
  });

  // Drag and Drop
  uploadZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('drag-active');
  });

  uploadZone?.addEventListener('dragleave', () => {
    uploadZone.classList.remove('drag-active');
  });

  uploadZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('drag-active');
    
    if (e.dataTransfer && e.dataTransfer.files) {
      handleFilesSelection(e.dataTransfer.files);
    }
  });


  /* ---- Description Character Count ---- */
  const textarea    = document.getElementById('productDesc');
  const charCurrent = document.getElementById('charCurrent');
  const maxChars    = 1000;

  function updateCharCount() {
    if (!textarea || !charCurrent) return;
    const len = textarea.value.length;
    charCurrent.textContent = len;

    if (len >= maxChars) {
      charCurrent.style.color = '#c0533a';
      charCurrent.style.fontWeight = '600';
    } else if (len >= maxChars * 0.9) {
      charCurrent.style.color = '#a06a45';
      charCurrent.style.fontWeight = '500';
    } else {
      charCurrent.style.color = '';
      charCurrent.style.fontWeight = '';
    }
  }

  textarea?.addEventListener('input', updateCharCount);
  updateCharCount();


  /* ---- Form Validation & Submission ---- */
  const form             = document.getElementById('productForm');
  const nameInput        = document.getElementById('productName');
  const nameField        = document.getElementById('nameField');
  const categorySelect   = document.getElementById('productCategory');
  const categoryField    = document.getElementById('categoryField');
  const priceInput       = document.getElementById('productPrice');
  const priceField       = document.getElementById('priceField');
  const discountInput    = document.getElementById('productDiscount');
  const discountField    = document.getElementById('discountField');

  const submitBtn        = document.getElementById('submitBtn');
  const imagesErrorMsg   = document.getElementById('imagesError');
  const nameError        = document.getElementById('nameError');
  const productId        = form?.action.split('/').pop();

  let isNameDuplicate = false;
  let isCheckingDuplicate = false;
  let nameCheckTimeout = null;

  async function performDuplicateCheck() {
    const val = nameInput.value.trim();
    if (!val) {
      nameField?.classList.remove('field--error');
      if (nameError) nameError.textContent = 'Product name is required';
      isNameDuplicate = false;
      return;
    }

    isCheckingDuplicate = true;
    try {
      const response = await fetch('/admin/products/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: val, id: productId })
      });
      const data = await response.json();
      if (data.exists) {
        nameField?.classList.add('field--error');
        if (nameError) nameError.textContent = 'Product name already exists';
        isNameDuplicate = true;
      } else {
        nameField?.classList.remove('field--error');
        isNameDuplicate = false;
      }
    } catch (err) {
      console.error('Error verifying duplicate status:', err);
    } finally {
      isCheckingDuplicate = false;
    }
  }

  // Input clear events and debounced duplicate check
  nameInput?.addEventListener('input', () => {
    nameField.classList.remove('field--error');
    clearTimeout(nameCheckTimeout);
    nameCheckTimeout = setTimeout(performDuplicateCheck, 300);
  });
  categorySelect?.addEventListener('change', () => categoryField.classList.remove('field--error'));
  priceInput?.addEventListener('input', () => priceField.classList.remove('field--error'));

  discountInput?.addEventListener('input', () => discountField.classList.remove('field--error'));

  /* ---- Dynamic Category Variants ---- */
  const productCategorySelect = document.getElementById('productCategory');
  const variantsContainer = document.getElementById('variantsContainer');
  const combinationsTableContainer = document.getElementById('combinationsTableContainer');

  function renderCategoryVariants() {
    if (!variantsContainer) return;
    variantsContainer.innerHTML = '';
    if (combinationsTableContainer) combinationsTableContainer.innerHTML = '';

    const catId = productCategorySelect.value;
    if (!catId) return;

    const category = categoriesData.find(c => c._id === catId);
    if (!category || !category.variants || category.variants.length === 0) return;

    category.variants.forEach((v, index) => {
      const fieldDiv = document.createElement('div');
      fieldDiv.className = 'field';
      fieldDiv.id = `variantField_${index}`;
      fieldDiv.dataset.variantName = v.name;

      const existingVar = productVariantsData.find(pv => pv.name === v.name);
      const existingOptions = existingVar ? existingVar.options : [];

      let checkboxOptionsHTML = '';
      v.options.forEach(opt => {
        const isChecked = existingOptions.includes(opt) ? 'checked' : '';
        checkboxOptionsHTML += `
          <label class="size-checkbox-btn">
            <input type="checkbox" name="productVariants[${v.name}][]" value="${opt}" ${isChecked} />
            <span class="size-text">${opt}</span>
          </label>
        `;
      });

      fieldDiv.innerHTML = `
        <label class="field__label">${v.name} Options <span class="required">*</span></label>
        <div class="size-checkbox-group">
          ${checkboxOptionsHTML}
        </div>
        <span class="field__error-msg">Please select at least one option for ${v.name}</span>
      `;

      fieldDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          fieldDiv.classList.remove('field--error');
          buildCombinationsTable();
        });
      });

      variantsContainer.appendChild(fieldDiv);
    });

    buildCombinationsTable();
  }

  function getCombinations(optionsObj) {
    const keys = Object.keys(optionsObj);
    if (keys.length === 0) return [];
    
    let results = [{}];
    keys.forEach(key => {
      const values = optionsObj[key];
      const nextResults = [];
      results.forEach(res => {
        values.forEach(val => {
          nextResults.push({
            ...res,
            [key]: val
          });
        });
      });
      results = nextResults;
    });
    return results;
  }

  function findExistingCombination(comb) {
    if (typeof productCombinationsData === 'undefined' || !productCombinationsData.length) return null;
    return productCombinationsData.find(saved => {
      const savedKeys = Object.keys(saved.attributes || {});
      const combKeys = Object.keys(comb);
      if (savedKeys.length !== combKeys.length) return false;
      return combKeys.every(k => saved.attributes[k] === comb[k]);
    });
  }

  function buildCombinationsTable() {
    if (!combinationsTableContainer) return;
    combinationsTableContainer.innerHTML = '';

    const checkedByVariant = {};
    const fields = variantsContainer.querySelectorAll('.field');
    fields.forEach(field => {
      const varName = field.dataset.variantName;
      const checked = Array.from(field.querySelectorAll('input[type="checkbox"]:checked')).map(cb => cb.value);
      if (checked.length > 0) {
        checkedByVariant[varName] = checked;
      }
    });

    const expectedVariantsCount = fields.length;
    const actualCheckedVariantsCount = Object.keys(checkedByVariant).length;
    
    if (expectedVariantsCount === 0 || actualCheckedVariantsCount < expectedVariantsCount) {
      return;
    }

    const combinationsList = getCombinations(checkedByVariant);
    if (combinationsList.length === 0) return;

    let tableHTML = `
      <label class="field__label" style="font-weight: 600;">Variant Prices & Combinations <span class="required">*</span></label>
      <div style="overflow-x: auto; margin-top: 10px; border: 1.5px solid var(--line); border-radius: 12px; background: rgba(255, 255, 255, 0.45); padding: 8px;">
        <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.9rem;">
          <thead>
            <tr style="border-bottom: 1.5px solid var(--line); background: rgba(0,0,0,0.02);">
              <th style="padding: 12px; font-weight: 600; color: var(--text);">Combination Attributes</th>
              <th style="padding: 12px; font-weight: 600; color: var(--text); width: 160px;">Price ($)</th>
              <th style="padding: 12px; font-weight: 600; color: var(--text); width: 160px;">Discount Price ($)</th>
            </tr>
          </thead>
          <tbody>
    `;

    combinationsList.forEach((comb, idx) => {
      const label = Object.entries(comb).map(([k, v]) => `${k}: ${v}`).join(', ');
      const existing = findExistingCombination(comb);
      
      const defaultPrice = document.getElementById('productPrice')?.value || 0;
      const defaultDiscount = document.getElementById('productDiscountPrice')?.value || 0;

      const priceVal = existing ? existing.price : defaultPrice;
      const discountVal = existing ? existing.discountPrice : defaultDiscount;

      let hiddenAttributesHTML = '';
      Object.entries(comb).forEach(([k, v]) => {
        hiddenAttributesHTML += `<input type="hidden" name="combinations[${idx}][attributes][${k}]" value="${v}" />`;
      });

      tableHTML += `
        <tr style="border-bottom: 1px solid var(--line);">
          <td style="padding: 12px; font-weight: 500; color: var(--text);">${label}${hiddenAttributesHTML}</td>
          <td style="padding: 6px 12px;">
            <input type="number" name="combinations[${idx}][price]" class="field__input" value="${priceVal}" min="0" step="0.01" required style="padding: 8px 12px; font-size: 0.9rem; background: var(--panel-strong);" />
          </td>
          <td style="padding: 6px 12px;">
            <input type="number" name="combinations[${idx}][discountPrice]" class="field__input" value="${discountVal}" min="0" step="0.01" style="padding: 8px 12px; font-size: 0.9rem; background: var(--panel-strong);" />
          </td>
        </tr>
      `;
    });

    tableHTML += `
          </tbody>
        </table>
      </div>
    `;

    combinationsTableContainer.innerHTML = tableHTML;
  }

  productCategorySelect?.addEventListener('change', renderCategoryVariants);
  renderCategoryVariants();

  const defaultPriceInput = document.getElementById('productPrice');
  const defaultDiscountInput = document.getElementById('productDiscountPrice');
  
  defaultPriceInput?.addEventListener('input', () => {
    buildCombinationsTable();
  });
  defaultDiscountInput?.addEventListener('input', () => {
    buildCombinationsTable();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop submission initially to handle async validation
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameField.classList.add('field--error');
      if (nameError) nameError.textContent = 'Product name is required';
      nameInput.focus();
      isValid = false;
    }

    // Wait for active duplicate checks to complete
    if (isValid) {
      if (isCheckingDuplicate) {
        await new Promise(resolve => {
          const interval = setInterval(() => {
            if (!isCheckingDuplicate) {
              clearInterval(interval);
              resolve();
            }
          }, 50);
        });
      } else {
        await performDuplicateCheck();
      }

      if (isNameDuplicate) {
        nameField.classList.add('field--error');
        if (nameError) nameError.textContent = 'Product name already exists';
        nameInput.focus();
        isValid = false;
      }
    }

    // Validate Category
    if (!categorySelect.value) {
      categoryField.classList.add('field--error');
      if (isValid) categorySelect.focus();
      isValid = false;
    }

    // Validate Price
    const priceVal = parseFloat(priceInput.value);
    if (isNaN(priceVal) || priceVal < 0) {
      priceField.classList.add('field--error');
      if (isValid) priceInput.focus();
      isValid = false;
    }

    // Validate Discount Price
    const discountVal = parseFloat(discountInput.value);
    if (!isNaN(discountVal) && discountVal >= 0 && discountVal >= priceVal) {
      discountField.classList.add('field--error');
      if (isValid) discountInput.focus();
      isValid = false;
    }



    // Validate Dynamic Category Variants
    if (variantsContainer) {
      const variantFields = variantsContainer.querySelectorAll('.field');
      variantFields.forEach(field => {
        const checkedOptions = field.querySelectorAll('input[type="checkbox"]:checked');
        if (checkedOptions.length === 0) {
          field.classList.add('field--error');
          isValid = false;
        } else {
          field.classList.remove('field--error');
        }
      });

      if (variantFields.length > 0 && (!combinationsTableContainer || !combinationsTableContainer.querySelector('table'))) {
        isValid = false;
      }
    }

    // Validate Total Images Count (must have at least 3 images total)
    if (activeExistingCount + selectedFiles.length < 3) {
      imagesErrorMsg.textContent = 'A product must have at least 3 images total';
      imagesErrorMsg.style.display = 'block';
      isValid = false;
    } else {
      imagesErrorMsg.style.display = 'none';
    }

    if (!isValid) {
      return;
    }

    // Pack new files into the file input using DataTransfer
    const dt = new DataTransfer();
    selectedFiles.forEach((item, index) => {
      if (item.croppedBlob) {
        const extension = item.file.name.substring(item.file.name.lastIndexOf('.')) || '.jpg';
        const name = `image-new-${index}${extension}`;
        const croppedFile = new File([item.croppedBlob], name, {
          type: item.croppedBlob.type || 'image/jpeg',
          lastModified: Date.now()
        });
        dt.items.add(croppedFile);
      } else {
        dt.items.add(item.file);
      }
    });

    imageInput.files = dt.files;

  /* ---- Helper: Show Toast ---- */
  function showToast(message, type = 'success') {
    const existing = document.getElementById('toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.id = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity .4s ease, transform .4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px) scale(0.95)';
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  }

  // Loading State
  submitBtn.disabled = true;
  submitBtn.classList.add('btn--loading');
  submitBtn.querySelector('.btn__text').textContent = 'Updating…';

  try {
    const formData = new FormData(form);
    const response = await fetch(form.action, {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      credentials: 'same-origin',
      body: formData
    });
    const data = await response.json();
    if (response.ok) {
      showToast(data.message || 'Product updated successfully', 'success');
      setTimeout(() => {
        window.location.href = '/admin/products?success=' + encodeURIComponent(data.message || 'Product updated successfully');
      }, 800);
    } else {
      showToast(data.error || 'Failed to update product', 'error');
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.querySelector('.btn__text').textContent = 'Update Product';
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to update product', 'error');
    submitBtn.disabled = false;
    submitBtn.classList.remove('btn--loading');
    submitBtn.querySelector('.btn__text').textContent = 'Update Product';
  }
  });

});
