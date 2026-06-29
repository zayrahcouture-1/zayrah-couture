/* ========================================
   Zayrah Couture — Admin · Products List (JS)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
  /* ---- Sidebar Toggle ---- */
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');

  function lockBody() {
    document.body.style.overflow = 'hidden';
  }

  function unlockBody() {
    const deleteModal = document.getElementById('deleteModal');
    const modalOpen = deleteModal?.classList.contains('show');
    const sidebarOpen = sidebar?.classList.contains('open');

    if (!modalOpen && !sidebarOpen) {
      document.body.style.overflow = '';
    }
  }

  function openSidebar() {
    sidebar?.classList.add('open');
    overlay?.classList.add('show');
    lockBody();
  }

  function closeSidebar() {
    sidebar?.classList.remove('open');
    overlay?.classList.remove('show');
    unlockBody();
  }

  menuBtn?.addEventListener('click', () => {
    if (sidebar?.classList.contains('open')) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  overlay?.addEventListener('click', closeSidebar);

  window.addEventListener('resize', () => {
    if (window.innerWidth > 980) {
      closeSidebar();
    }
  });

  /* ---- Search and Category Filter ---- */
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const grid = document.getElementById('productsGrid');

  if (grid) {
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    const filterProducts = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const selectedCategory = categoryFilter ? categoryFilter.value : '';

      cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const category = card.getAttribute('data-category') || '';

        const nameMatch = name.includes(query);
        const categoryMatch = !selectedCategory || category === selectedCategory;

        card.style.display = (nameMatch && categoryMatch) ? '' : 'none';
      });
    };

    searchInput?.addEventListener('input', filterProducts);
    categoryFilter?.addEventListener('change', filterProducts);
  }

  /* ---- Toggle switch ---- */
  document.querySelectorAll('.toggle-input').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const form = toggle.closest('form');
      if (form) form.submit();
    });
  });

  /* ---- Delete modal ---- */
  const deleteModal = document.getElementById('deleteModal');
  const deleteForm = document.getElementById('deleteForm');
  const deleteName = document.getElementById('deleteName');
  const cancelDelete = document.getElementById('cancelDelete');

  function openDeleteModal(id, name) {
    if (!deleteModal || !deleteForm || !deleteName) return;

    deleteName.textContent = name;
    deleteForm.action = '/admin/products/delete/' + id;
    deleteModal.classList.add('show');
    lockBody();
  }

  function closeDeleteModal() {
    deleteModal?.classList.remove('show');
    unlockBody();
  }

  document.querySelectorAll('.btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      openDeleteModal(id, name);
    });
  });

  cancelDelete?.addEventListener('click', closeDeleteModal);

  deleteModal?.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDeleteModal();
      closeSidebar();
    }
  });

  /* ---- Toast auto-dismiss ---- */
  const toast = document.getElementById('toast');

  if (toast) {
    setTimeout(() => {
      toast.style.transition = 'opacity .4s ease, transform .4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px) scale(0.95)';

      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  }
});