export class NavbarController {
  constructor() {
    this.toggleButton = document.getElementById('nav-toggle');
    this.menu = document.getElementById('nav-menu');
    this.isOpen = false;
    this.init();
  }

  init() {
    if (!this.toggleButton || !this.menu) return;
    this.toggleButton.addEventListener('click', () => this.toggle());
    
    // Accessibility: Keyboard Navigation (Escape key closes drawer)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
        this.toggleButton.focus();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.toggleButton.setAttribute('aria-expanded', 'true');
    this.menu.classList.add('is-active');
  }

  close() {
    this.isOpen = false;
    this.toggleButton.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('is-active');
  }
}

document.addEventListener('DOMContentLoaded', () => new NavbarController());
