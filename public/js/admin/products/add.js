/* ========================================
   Zayrah Couture — Add Product (JS)
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


  /* ---- Multiple Image Upload & Cropping ---- */
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
    // Clear grid
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

    // Add plus button/card if less than 5 images
    if (selectedFiles.length < 5) {
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
    if (selectedFiles.length < 3) {
      imagesErrorMsg.textContent = `At least 3 images are required (currently ${selectedFiles.length} added)`;
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
    
    // Check total images limit
    if (selectedFiles.length + filesToCrop.length + files.length > 5) {
      alert('You can upload a maximum of 5 images per product.');
      return;
    }

    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      filesToCrop.push({
        id: Date.now() + Math.random(),
        file: file
      });
    });

    // Clear input to allow re-selecting same files
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
        aspectRatio: 1, // force 1:1 square crop
        viewMode: 1,
        autoCropArea: 1,
        responsive: true,
        background: false
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
    activeCropId = null;
    activeCropIsReCrop = false;
    activeCropFile = null;
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

  // Drag and Drop events
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

  // Input clear events
  nameInput?.addEventListener('input', () => nameField.classList.remove('field--error'));
  categorySelect?.addEventListener('change', () => categoryField.classList.remove('field--error'));
  priceInput?.addEventListener('input', () => priceField.classList.remove('field--error'));

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



    // Validate Images Count
    if (selectedFiles.length < 3) {
      imagesErrorMsg.textContent = 'At least 3 product images are required';
      imagesErrorMsg.style.display = 'block';
      isValid = false;
    } else {
      imagesErrorMsg.style.display = 'none';
    }

    if (!isValid) {
      e.preventDefault();
      return;
    }

    // Pack files into the files input using DataTransfer
    const dt = new DataTransfer();
    selectedFiles.forEach((item, index) => {
      if (item.croppedBlob) {
        // Name the file
        const extension = item.file.name.substring(item.file.name.lastIndexOf('.')) || '.jpg';
        const name = `image-${index}${extension}`;
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
    submitBtn.querySelector('.btn__text').textContent = 'Saving…';
  });

});
