import './styles.css';
// Native HTML remains readable and navigable when JavaScript is unavailable.
const galleryControls = document.querySelector<HTMLElement>('.phototab-strip');
if (galleryControls) galleryControls.hidden = false;
const image = document.querySelector<HTMLImageElement>('.phototab-img');
const fullsize = document.querySelector<HTMLAnchorElement>('#product-fullsize');
const buttons = [...document.querySelectorAll<HTMLButtonElement>('.phototab-btn')];
for (const button of buttons) button.addEventListener('click', () => {
  const src = button.dataset.src;
  if (!src || !image || !fullsize) return;
  image.src = src;
  image.alt = button.dataset.alt || 'Gnomon prototype interface';
  fullsize.href = src;
  for (const item of buttons) item.setAttribute('aria-pressed', String(item === button));
});
const copy = document.querySelector<HTMLButtonElement>('#copy-email');
copy?.addEventListener('click', async () => {
  const status = document.querySelector<HTMLElement>('#copy-status');
  try {
    await navigator.clipboard.writeText('minhhoang250803@gmail.com');
    if (status) status.textContent = 'Email copied.';
  } catch {
    if (status) status.textContent = 'Select the email address to copy it, or open the email link.';
  }
});
