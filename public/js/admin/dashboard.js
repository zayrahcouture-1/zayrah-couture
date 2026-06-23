const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

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