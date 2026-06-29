/* ═══════════════════════════════════════════════════════════════
   Zayrah Couture — Admin · Categories List  (JS)
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Sidebar toggle (identical to dashboard) ── */
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


  /* ── Search filter ── */
  const searchInput = document.getElementById('searchInput');
  const grid        = document.getElementById('categoriesGrid');

  if (searchInput && grid) {
    const cards = Array.from(grid.querySelectorAll('.category-card'));

    searchInput.addEventListener('input', () => {
      const query = searchInput.value.toLowerCase().trim();

      cards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const match = name.includes(query);
        card.style.display = match ? '' : 'none';
      });
    });
  }


  /* ── Helper: Show Toast ── */
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

  /* ── Toggle switch (isListed / Featured) via AJAX ── */
  document.querySelectorAll('.toggle-input').forEach(toggle => {
    toggle.addEventListener('change', async (e) => {
      const form = toggle.closest('form');
      if (!form) return;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          headers: {
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'same-origin'
        });
        const data = await response.json();
        if (response.ok) {
          showToast(data.message || 'Status updated successfully', 'success');
        } else {
          toggle.checked = !toggle.checked; // Revert checkbox state
          showToast(data.message || 'Failed to update status', 'error');
        }
      } catch (err) {
        console.error(err);
        toggle.checked = !toggle.checked; // Revert checkbox state
        showToast('Failed to update status', 'error');
      }
    });
  });


  /* ── Delete modal ── */
  const deleteModal  = document.getElementById('deleteModal');
  const deleteForm   = document.getElementById('deleteForm');
  const deleteName   = document.getElementById('deleteName');
  const cancelDelete = document.getElementById('cancelDelete');

  function openDeleteModal(id, name) {
    if (!deleteModal || !deleteForm || !deleteName) return;
    deleteName.textContent = name;
    deleteForm.action = '/admin/categories/delete/' + id;
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


  /* ── Toast auto‑dismiss ── */
  const toast = document.getElementById('toast');
  if (toast) {
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  }

});
