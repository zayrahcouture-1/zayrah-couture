/* ── Password visibility toggle ─────────────────── */
const toggleBtn = document.getElementById('togglePwd');
const pwdInput  = document.getElementById('password');
const eyeIcon   = document.getElementById('eyeIcon');

const eyeOpen   = `<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/>`;
const eyeClosed = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = pwdInput.type === 'password';
    pwdInput.type  = isHidden ? 'text' : 'password';
    eyeIcon.innerHTML = isHidden ? eyeClosed : eyeOpen;
    toggleBtn.setAttribute('aria-label', isHidden ? 'Hide password' : 'Show password');
  });
}

/* ── Form loading state ─────────────────────────── */
const form    = document.querySelector('.form');
const authBtn = document.querySelector('.btn-auth');

if (form && authBtn) {
  form.addEventListener('submit', (e) => {
    const userId = document.getElementById('userId').value.trim();
    const pwd    = document.getElementById('password').value;
    if (!userId || !pwd) return;
    authBtn.classList.add('is-loading');
    authBtn.disabled = true;
  });
}