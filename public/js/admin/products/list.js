/* ========================================
   Zayrah Couture — Admin · Products List (JS)
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


  /* ---- Search Filter ---- */
  const searchInput = document.getElementById('searchInput');
  const grid        = document.getElementById('productsGrid');

  if (searchInput && grid) {
    const cards = Array.from(grid.querySelectorAll('.product-card'));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();

      cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const match = name.includes(query);
        card.style.display = match ? '' : 'none';
      });
    });
  }


  /* ---- Toggle switch (isListed) ---- */
  document.querySelectorAll('.toggle-input').forEach(toggle => {
    toggle.addEventListener('change', () => {
      const form = toggle.closest('form');
      if (form) form.submit();
    });
  });


  /* ---- Delete modal ---- */
  const deleteModal  = document.getElementById('deleteModal');
  const deleteForm   = document.getElementById('deleteForm');
  const deleteName   = document.getElementById('deleteName');
  const cancelDelete = document.getElementById('cancelDelete');

  function openDeleteModal(id, name) {
    if (!deleteModal || !deleteForm || !deleteName) return;
    deleteName.textContent = name;
    deleteForm.action = '/admin/products/delete/' + id;
    deleteModal.classList.add('show');
  }

  function closeDeleteModal() {
    deleteModal?.classList.remove('show');
  }

  // Attach to all delete buttons
  document.querySelectorAll('.btn--delete').forEach(btn => {
    btn.addEventListener('click', () => {
      const id   = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      openDeleteModal(id, name);
    });
  });

  // Close on cancel button
  cancelDelete?.addEventListener('click', closeDeleteModal);

  // Close on overlay click
  deleteModal?.addEventListener('click', (e) => {
    if (e.target === deleteModal) closeDeleteModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDeleteModal();
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
