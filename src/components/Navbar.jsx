import { useEffect, useState, useCallback } from 'react';

const NAV_ITEMS = [
  { label: 'Inicio', href: '#hero' },
  { label: 'Proyectos', href: '#projects' },
  { label: 'Contacto', href: '#contact' },
];

export default function Navbar({ lenisRef }) {
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // IntersectionObserver for active section highlight
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3, rootMargin: '-80px 0px 0px 0px' }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Track scroll for navbar background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = useCallback(
    (e, href) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target && lenisRef?.current) {
        lenisRef.current.scrollTo(target, { offset: -80 });
      }
      setMenuOpen(false);
    },
    [lenisRef]
  );

  return (
    <nav
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
        ? 'glass py-3'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <a
          href="#hero"
          onClick={(e) => handleNavClick(e, '#hero')}
          className="font-signature font-normal text-3xl sm:text-4xl tracking-wider text-light hover:opacity-80 transition-opacity"
        >
          Paulo Jimenez Guadamuz
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`nav-link font-body text-sm tracking-wide uppercase transition-opacity ${activeSection === item.href.slice(1)
                  ? 'active text-light opacity-100'
                  : 'text-light/60 hover:text-light/90'
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden relative w-8 h-8 flex flex-col justify-center items-center gap-1.5"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
          />
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${menuOpen ? 'opacity-0' : ''
              }`}
          />
          <span
            className={`block w-6 h-0.5 bg-light transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
          />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ${menuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <ul className="px-6 pb-6 pt-2 flex flex-col gap-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`nav-link font-body text-sm tracking-wide uppercase block py-2 ${activeSection === item.href.slice(1)
                  ? 'active text-light'
                  : 'text-light/60'
                  }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
