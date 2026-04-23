// NAVBAR SCROLL
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// MOBILE MENU
document.getElementById('hamburger').addEventListener('click', () => {
  document.getElementById('mobileMenu').classList.add('open');
  document.body.style.overflow = 'hidden';
});
function closeMobile() {
  document.getElementById('mobileMenu').classList.remove('open');
  document.body.style.overflow = '';
}

// Evento de clique do novo botão "X" para fechar o menu
document.getElementById('closeMenuBtn').addEventListener('click', closeMobile);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeMobile();
});

// SCROLL REVEAL
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), 60);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => observer.observe(el));

// FORM SUBMIT
function handleFormSubmit(btn) {
  const orig = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check" style="margin-right:8px"></i> Mensagem enviada!';
  btn.style.background = 'linear-gradient(135deg, #4CAF50, #2E7D32)';
  btn.style.color = 'white';
  setTimeout(() => {
    btn.innerHTML = orig;
    btn.style.background = '';
    btn.style.color = '';
  }, 3000);
}

// SMOOTH NAV ACTIVE
const sections = document.querySelectorAll('section[id]');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.style.color = a.getAttribute('href') === `#${current}` ? 'var(--gold)' : '';
  });
});