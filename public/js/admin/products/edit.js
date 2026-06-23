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
  let cropper = null;
  let activeCropId = null;

  function renderPreviews() {
    uploadGrid.innerHTML = '';
    
    if (selectedFiles.length === 0) {
      uploadGrid.style.display = 'none';
      uploadContent.style.display = 'flex';
      return;
    }

    uploadGrid.style.display = 'grid';
    uploadContent.style.display = 'none';

    selectedFiles.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'upload-preview-item';

      const displayUrl = item.croppedBlob 
        ? URL.createObjectURL(item.croppedBlob) 
        : URL.createObjectURL(item.file);

      itemEl.innerHTML = `
        <img src="${displayUrl}" alt="Preview" />
        <div class="upload-preview-item__actions">
          <button type="button" class="upload-preview-item__btn upload-preview-item__btn--crop" title="Crop Image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/><path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/></svg>
          </button>
          <button type="button" class="upload-preview-item__btn upload-preview-item__btn--delete" title="Delete Image">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `;

      itemEl.querySelector('.upload-preview-item__btn--crop').addEventListener('click', (e) => {
        e.stopPropagation();
        openCropModal(item.id);
      });

      itemEl.querySelector('.upload-preview-item__btn--delete').addEventListener('click', (e) => {
        e.stopPropagation();
        deleteImageItem(item.id);
      });

      uploadGrid.appendChild(itemEl);
    });
  }

  function handleFilesSelection(files) {
    if (!files || files.length === 0) return;
    
    // Total combined image limit (existing non-deleted + newly uploaded)
    if (activeExistingCount + selectedFiles.length + files.length > 5) {
      alert('A product can have a maximum of 5 images total.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      selectedFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        croppedBlob: null
      });
    });

    renderPreviews();
    imageInput.value = '';
  }

  function deleteImageItem(id) {
    selectedFiles = selectedFiles.filter(item => item.id !== id);
    renderPreviews();
  }

  function openCropModal(id) {
    const item = selectedFiles.find(x => x.id === id);
    if (!item) return;

    activeCropId = id;
    
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
    reader.readAsDataURL(item.file);
  }

  function closeCropModal() {
    cropModalOverlay.classList.remove('show');
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
    activeCropId = null;
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

  // Cancel Crop
  cancelCropBtn?.addEventListener('click', closeCropModal);

  // Confirm Crop
  confirmCropBtn?.addEventListener('click', () => {
    if (!cropper) return;

    const canvas = cropper.getCroppedCanvas({
      width: 600,
      height: 600
    });

    if (canvas) {
      canvas.toBlob((blob) => {
        if (blob) {
          const item = selectedFiles.find(x => x.id === activeCropId);
          if (item) {
            item.croppedBlob = blob;
            renderPreviews();
          }
        }
        closeCropModal();
      }, 'image/jpeg', 0.9);
    }
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
  const stockInput        = document.getElementById('productStock');
  const stockField       = document.getElementById('stockField');
  const submitBtn        = document.getElementById('submitBtn');
  const imagesErrorMsg   = document.getElementById('imagesError');

  // Input clear events
  nameInput?.addEventListener('input', () => nameField.classList.remove('field--error'));
  categorySelect?.addEventListener('change', () => categoryField.classList.remove('field--error'));
  priceInput?.addEventListener('input', () => priceField.classList.remove('field--error'));
  stockInput?.addEventListener('input', () => stockField.classList.remove('field--error'));
  discountInput?.addEventListener('input', () => discountField.classList.remove('field--error'));

  form?.addEventListener('submit', (e) => {
    let isValid = true;

    // Validate Name
    if (!nameInput.value.trim()) {
      nameField.classList.add('field--error');
      nameInput.focus();
      isValid = false;
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

    // Validate Stock
    const stockVal = parseInt(stockInput.value);
    if (isNaN(stockVal) || stockVal < 0) {
      stockField.classList.add('field--error');
      if (isValid) stockInput.focus();
      isValid = false;
    }

    // Validate Total Images Count (must have at least one image total)
    if (activeExistingCount + selectedFiles.length === 0) {
      imagesErrorMsg.style.display = 'block';
      isValid = false;
    } else {
      imagesErrorMsg.style.display = 'none';
    }

    if (!isValid) {
      e.preventDefault();
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

    // Loading State
    submitBtn.disabled = true;
    submitBtn.classList.add('btn--loading');
    submitBtn.querySelector('.btn__text').textContent = 'Updating…';
  });

});
