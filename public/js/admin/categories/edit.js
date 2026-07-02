/* ========================================
   Zayrah Couture — Edit Category (JS)
   ======================================== */

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


  /* ---- Image Upload & Preview with Cropper.js ---- */
  const uploadZone      = document.getElementById('uploadZone');
  const imageInput      = document.getElementById('imageInput');
  const uploadContent   = document.getElementById('uploadContent');
  const uploadPreview   = document.getElementById('uploadPreview');
  const previewImg      = document.getElementById('previewImg');
  const removeBtn       = document.getElementById('removeImage');
  const removeImageFlag = document.getElementById('removeImageFlag');

  // Crop Modal elements
  const cropModalOverlay = document.getElementById('cropModalOverlay');
  const cropperImage     = document.getElementById('cropperImage');
  const cancelCropBtn    = document.getElementById('cancelCrop');
  const confirmCropBtn   = document.getElementById('confirmCrop');

  let cropper = null;
  let currentFile = null;

  function initCropper(file) {
    if (!file || !file.type.startsWith('image/')) return;
    currentFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      cropperImage.src = e.target.result;
      cropModalOverlay.classList.add('show');

      if (cropper) {
        cropper.destroy();
      }

      // Initialize Cropper.js
      cropper = new Cropper(cropperImage, {
        aspectRatio: 3 / 4, // 3:4 Aspect Ratio
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false,
      });
    };
    reader.readAsDataURL(file);
  }

  function closeCropModal() {
    cropModalOverlay.classList.remove('show');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    imageInput.value = ''; // Reset input
  }

  function clearPreview() {
    imageInput.value = '';
    previewImg.src = '';
    uploadContent.style.display = 'block';
    uploadPreview.style.display = 'none';
    // Flag that the existing image should be removed
    if (removeImageFlag) removeImageFlag.value = 'true';
  }

  // Click to browse
  uploadZone?.addEventListener('click', (e) => {
    if (e.target.closest('.upload-zone__remove')) return;
    imageInput?.click();
  });

  imageInput?.addEventListener('change', () => {
    if (imageInput.files && imageInput.files[0]) {
      initCropper(imageInput.files[0]);
    }
  });

  // Cancel crop
  cancelCropBtn?.addEventListener('click', closeCropModal);

  // Confirm crop
  confirmCropBtn?.addEventListener('click', () => {
    if (!cropper) return;

    // Get the cropped canvas
    const canvas = cropper.getCroppedCanvas({
      width: 600,
      height: 800,
    });

    if (canvas) {
      canvas.toBlob((blob) => {
        if (!blob) return;

        // Show cropped image in preview
        const croppedUrl = URL.createObjectURL(blob);
        previewImg.src = croppedUrl;
        uploadContent.style.display = 'none';
        uploadPreview.style.display = 'flex';
        // A new image is being uploaded, so don't flag as removed
        if (removeImageFlag) removeImageFlag.value = 'false';

        // Pack the cropped blob into the file input using DataTransfer
        const croppedFile = new File([blob], currentFile.name || 'cropped-category.jpg', {
          type: blob.type || 'image/jpeg',
          lastModified: Date.now()
        });

        const dt = new DataTransfer();
        dt.items.add(croppedFile);
        imageInput.files = dt.files;

        // Close the modal
        cropModalOverlay.classList.remove('show');
        cropper.destroy();
        cropper = null;
      }, 'image/jpeg', 0.9);
    }
  });

  // Remove image
  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    clearPreview();
  });

  // Drag and drop
  uploadZone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.add('drag-active');
  });

  // Drag leave
  uploadZone?.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-active');
  });

  // Drop image
  uploadZone?.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadZone.classList.remove('drag-active');

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      initCropper(files[0]);
    }
  });



  /* ---- Character Count ---- */
  const textarea    = document.getElementById('categoryDesc');
  const charCurrent = document.getElementById('charCurrent');
  const maxChars    = 500;

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
  updateCharCount(); // init with existing content


  /* ---- Dynamic Category Variants ---- */
  const addVariantBtn = document.getElementById('addVariantBtn');
  const variantsContainer = document.getElementById('variantsContainer');

  addVariantBtn?.addEventListener('click', () => {
    const row = document.createElement('div');
    row.className = 'variant-row';
    row.style.display = 'flex';
    row.style.gap = '12px';
    row.style.alignItems = 'center';
    row.style.background = 'rgba(255, 255, 255, 0.4)';
    row.style.padding = '12px';
    row.style.borderRadius = '12px';
    row.style.border = '1px solid var(--line)';

    row.innerHTML = `
      <div style="flex: 1;">
        <input type="text" name="variantNames[]" class="field__input" placeholder="Variant Name (e.g. Size)" required style="background: var(--panel-strong);" />
      </div>
      <div style="flex: 2;">
        <input type="text" name="variantOptions[]" class="field__input" placeholder="Options (comma separated, e.g. S, M, L)" required style="background: var(--panel-strong);" />
      </div>
      <button type="button" class="remove-variant-btn" style="background: none; border: none; color: var(--red); cursor: pointer; padding: 8px;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    row.querySelector('.remove-variant-btn').addEventListener('click', () => {
      row.remove();
    });

    variantsContainer.appendChild(row);
  });

  document.querySelectorAll('.remove-variant-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.currentTarget.closest('.variant-row').remove();
    });
  });

  /* ---- Client-Side Form Validation ---- */
  const form      = document.getElementById('categoryForm');
  const nameInput = document.getElementById('categoryName');
  const nameField = document.getElementById('nameField');
  const submitBtn = document.getElementById('submitBtn');
  const nameError = document.getElementById('nameError');
  const categoryId = form?.action.split('/').pop();

  let isNameDuplicate = false;
  let isCheckingDuplicate = false;
  let nameCheckTimeout = null;

  async function performDuplicateCheck() {
    const val = nameInput.value.trim();
    if (!val) {
      nameField?.classList.remove('field--error');
      if (nameError) nameError.textContent = 'Category name is required';
      isNameDuplicate = false;
      return;
    }

    isCheckingDuplicate = true;
    try {
      const response = await fetch('/admin/categories/check-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: val, id: categoryId })
      });
      const data = await response.json();
      if (data.exists) {
        nameField?.classList.add('field--error');
        if (nameError) nameError.textContent = 'Category name already exists';
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

  // Clear error on typing and trigger debounced duplicate check
  nameInput?.addEventListener('input', () => {
    if (nameInput.value.trim().length > 0) {
      nameField?.classList.remove('field--error');
    }
    clearTimeout(nameCheckTimeout);
    nameCheckTimeout = setTimeout(performDuplicateCheck, 300);
  });

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

  form?.addEventListener('submit', async (e) => {
    e.preventDefault(); // Stop submission initially to handle async validation

    let isValid = true;

    // Validate name
    if (!nameInput.value.trim()) {
      nameField?.classList.add('field--error');
      if (nameError) nameError.textContent = 'Category name is required';
      nameInput?.focus();
      isValid = false;
    }

    if (!isValid) {
      return;
    }

    // Wait for active duplicate checks to complete
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
      nameField?.classList.add('field--error');
      if (nameError) nameError.textContent = 'Category name already exists';
      nameInput?.focus();
      return;
    }

    // Loading state on submit button
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
        showToast(data.message || 'Category updated successfully', 'success');
        setTimeout(() => {
          window.location.href = '/admin/categories?success=' + encodeURIComponent(data.message || 'Category updated successfully');
        }, 800);
      } else {
        showToast(data.error || 'Failed to update category', 'error');
        // Revert loading state only on failure
        submitBtn.disabled = false;
        submitBtn.classList.remove('btn--loading');
        submitBtn.querySelector('.btn__text').textContent = 'Update Category';
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to update category', 'error');
      // Revert loading state only on failure
      submitBtn.disabled = false;
      submitBtn.classList.remove('btn--loading');
      submitBtn.querySelector('.btn__text').textContent = 'Update Category';
    }
  });

});
