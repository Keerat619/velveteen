import { useEffect, useRef, useState } from 'react';
import { navItems } from '../data/siteContent.js';

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
      <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function VelveteenMark() {
  return (
    <svg viewBox="0 0 46 22" aria-hidden="true">
      <path d="M22.5 20C20 14 16 9 8 4M22.5 20C25 13 31 7 39 3M22.5 20v-7" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 4c3 0 5 1.5 5.5 4-2.8.8-5.2.1-6.7-1.4M39 3c-3.1 0-5.1 1.5-5.8 4 2.9.8 5.4.1 7-1.4M22.5 10.5c-2.2-2.4-2.2-4.5 0-6.3 2.2 1.8 2.2 3.9 0 6.3Z" fill="currentColor" />
    </svg>
  );
}

export function Navigation({ onSelectProduct }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openButtonRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    const nav = document.getElementById('navigation');
    if (!nav) return undefined;

    let lastY = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < 3) return;
      const shouldHide = dy > 0 && y > 140 && !menuOpen;
      if (shouldHide !== hidden) {
        hidden = shouldHide;
        nav.classList.toggle('is-hidden', shouldHide);
      }
      lastY = y;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [menuOpen]);

  useEffect(() => {
    if (menuOpen) {
      window.lenis?.stop();
      closeButtonRef.current?.focus();
    } else {
      window.lenis?.start();
    }
  }, [menuOpen]);

  const openMenu = () => {
    setMenuOpen(true);
    window.lenis?.stop();
  };

  const closeMenu = (restoreFocus = true) => {
    setMenuOpen(false);
    window.lenis?.start();
    if (restoreFocus) requestAnimationFrame(() => openButtonRef.current?.focus());
  };

  const handleOrderClick = () => {
    onSelectProduct('Custom bouquet');
    closeMenu(false);
  };

  return (
    <header id="navigation" data-8b-section="navigation">
      <a className="nav__brand" href="#opening" aria-label="Velveteen, to the top">
        <VelveteenMark />
        <span>VELVETEEN</span>
      </a>
      <nav className="nav__links" aria-label="Main">
        {navItems.map((item) => (
          <a className="m-link-2" href={item.href} key={item.href}>
            {item.label}
          </a>
        ))}
      </nav>
      <a className="nav__cta" href="#contact" onClick={() => onSelectProduct('Custom bouquet')}>
        Custom order <span className="m-icon"><ArrowIcon /></span>
      </a>
      <button
        ref={openButtonRef}
        className="nav__menu m-icon"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="menu"
        aria-label={menuOpen ? 'Close the menu' : 'Open the menu'}
        onClick={() => (menuOpen ? closeMenu() : openMenu())}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M1 4.5h14M1 11.5h14" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>
      {/* data-8b-part: section-script:navigation — responsive template menu behavior */}
      <div
        className="menu"
        id="menu"
        data-lenis-prevent
        hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Velveteen menu"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            closeMenu();
            return;
          }
          if (event.key === 'Tab') {
            const focusable = [...event.currentTarget.querySelectorAll('a[href], button:not([disabled])')];
            const first = focusable[0];
            const last = focusable.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
        }}
      >
        <div className="menu__top">
          <span className="m-text-3">VELVETEEN</span>
          <button ref={closeButtonRef} className="menu__close m-icon" type="button" aria-label="Close the menu" onClick={() => closeMenu()}>
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 3l10 10M13 3L3 13" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </button>
        </div>
        <nav className="menu__links" aria-label="Menu">
          {navItems.map((item) => (
            <a href={item.href} key={item.href} onClick={() => closeMenu(false)}>
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={handleOrderClick}>Custom order</a>
        </nav>
        <div className="menu__foot">
          <p className="m-text-8">Handmade pipe-cleaner flowers and keepsakes<br />Custom requests are always welcome.</p>
          <a className="m-link" href="#contact" onClick={handleOrderClick}>Ask the studio</a>
        </div>
      </div>
    </header>
  );
}

export function Footer({ onSelectProduct }) {
  const startCustomOrder = () => onSelectProduct('Custom bouquet');

  return (
    <footer id="footer" data-8b-section="footer">
      <div className="ft__mark" aria-label="Velveteen wordmark">
        <span className="ft__rect">VELV</span>
        <span className="ft__bar" aria-hidden="true" />
        <span className="ft__dome">ETEEN</span>
      </div>
      <div className="ft__cols">
        <nav className="ft__col" aria-label="The collection">
          <p className="m-text-3">The collection</p>
          <a className="m-link-2" href="#season">On the bench</a>
          <a className="m-link-2" href="#work">Arrangements</a>
          <a className="m-link-2" href="#dusk">Made by hand</a>
          <a className="m-link-2" href="#standing">Ways to gift</a>
        </nav>
        <nav className="ft__col" aria-label="For the moment">
          <p className="m-text-3">For the moment</p>
          <a className="m-link-2" href="#events">Celebrations</a>
          <a className="m-link-2" href="#school">Studio sessions</a>
          <a className="m-link-2" href="#notes">A note from us</a>
          <a className="m-link-2" href="#faq">Questions</a>
        </nav>
        <nav className="ft__col" aria-label="Make it yours">
          <p className="m-text-3">Make it yours</p>
          <a className="m-link-2" href="#contact" onClick={startCustomOrder}>Custom bouquet</a>
          <a className="m-link-2" href="#contact" onClick={() => onSelectProduct('Personalised handmade gift')}>Personalised gift</a>
          <a className="m-link-2" href="#contact" onClick={() => onSelectProduct('Single handmade stem')}>A single stem</a>
          <a className="m-link-2" href="#contact" onClick={() => onSelectProduct('Flower-making session')}>Ask about a session</a>
        </nav>
        <div className="ft__col">
          <p className="m-text-3">The studio</p>
          <p>Small flowers, shaped by hand from soft chenille stems. Made to carry a little meaning and be kept close.</p>
          <a className="m-link-2" href="#contact" onClick={startCustomOrder}>Start an enquiry</a>
        </div>
      </div>
      <div className="ft__base m-text-8">
        <p>© 2026 VELVETEEN · Made by hand · Design: <a href="https://8b.com/" style={{ color: 'inherit' }} data-8b-credit>8B</a></p>
        <a className="m-link-2" href="#opening">Back to the top</a>
      </div>
    </footer>
  );
}
