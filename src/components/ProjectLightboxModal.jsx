import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useLang } from '../i18n/LanguageContext';
import { getLenis } from '../lib/motion';

export default function ProjectLightboxModal({ isOpen, project, initialIndex = 0, onClose }) {
  const { t } = useLang();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isChangingImage, setIsChangingImage] = useState(false);

  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);
  const lastFocusedRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const images = project ? [project.image, ...(project.gallery || [])] : [];
  const total = images.length;

  // Reset index whenever modal opens or project/initialIndex changes
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setIsRendered(true);
      lastFocusedRef.current = document.activeElement;

      // Small delay to trigger CSS transition
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsVisible(true);
          closeBtnRef.current?.focus();
        });
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialIndex, project]);

  // Lock Lenis & body scroll
  useEffect(() => {
    if (!isOpen) return;

    const lenis = getLenis();
    lenis?.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      lenis?.start();
      document.body.style.overflow = prevOverflow;
      lastFocusedRef.current?.focus?.();
    };
  }, [isOpen]);

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 280);
  }, [onClose]);

  const goToPrev = useCallback(() => {
    if (total <= 1) return;
    setIsChangingImage(true);
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
    setTimeout(() => setIsChangingImage(false), 200);
  }, [total]);

  const goToNext = useCallback(() => {
    if (total <= 1) return;
    setIsChangingImage(true);
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
    setTimeout(() => setIsChangingImage(false), 200);
  }, [total]);

  const goToIndex = useCallback(
    (idx) => {
      if (idx === currentIndex || idx < 0 || idx >= total) return;
      setIsChangingImage(true);
      setCurrentIndex(idx);
      setTimeout(() => setIsChangingImage(false), 200);
    },
    [currentIndex, total]
  );

  // Keyboard navigation & Focus trap
  useEffect(() => {
    if (!isOpen || !isRendered) return;

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
      } else if (e.key === 'Tab') {
        const focusable = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable || focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isRendered, handleClose, goToPrev, goToNext]);

  // Touch Swipe for mobile
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
  };

  if (!isRendered || !project) return null;

  const currentSrc = images[currentIndex] || project.image;
  const accentColor = project.palette?.accent || '#3b82f6';

  return createPortal(
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} - ${t('projects.view')}`}
      className={`project-lightbox-overlay ${isVisible ? 'is-visible' : ''}`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Bar */}
      <header
        className="project-lightbox__header"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
          />
          <span className="font-display font-semibold text-sm sm:text-base text-white tracking-wide">
            {project.title}
          </span>
          {total > 1 && (
            <span className="text-xs font-mono text-white/60 bg-white/10 px-2.5 py-0.5 rounded-full border border-white/10">
              {currentIndex + 1} {t('projects.image_of') || '/'} {total}
            </span>
          )}
        </div>

        <button
          ref={closeBtnRef}
          type="button"
          className="project-lightbox__btn-close"
          onClick={handleClose}
          aria-label={t('projects.close')}
          data-cursor="close"
        >
          <FiX className="w-6 h-6" />
        </button>
      </header>

      {/* Main Image Container */}
      <main
        className="project-lightbox__stage"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="project-lightbox__image-wrapper">
          <img
            key={currentSrc}
            src={currentSrc}
            alt={`${project.title} - ${currentIndex + 1}`}
            className={`project-lightbox__img ${isChangingImage ? 'is-changing' : ''}`}
            loading="eager"
            decoding="async"
            style={{
              boxShadow: `0 20px 60px -15px ${accentColor}25, 0 0 0 1px rgba(255, 255, 255, 0.1)`,
            }}
          />
        </div>

        {/* Previous Button */}
        {total > 1 && (
          <button
            type="button"
            className="project-lightbox__nav-btn project-lightbox__nav-btn--prev"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label={t('projects.prev_image')}
            data-cursor="arrow-left"
          >
            <FiChevronLeft className="w-7 h-7" />
          </button>
        )}

        {/* Next Button */}
        {total > 1 && (
          <button
            type="button"
            className="project-lightbox__nav-btn project-lightbox__nav-btn--next"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label={t('projects.next_image')}
            data-cursor="arrow-right"
          >
            <FiChevronRight className="w-7 h-7" />
          </button>
        )}
      </main>

      {/* Bottom Thumbnail Strip (if multiple images) */}
      {total > 1 && (
        <nav
          className="project-lightbox__thumbnails"
          aria-label="Gallery thumbnails"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10 max-w-full overflow-x-auto no-scrollbar">
            {images.map((img, i) => {
              const isActive = i === currentIndex;
              return (
                <button
                  key={img}
                  type="button"
                  onClick={() => goToIndex(i)}
                  className={`project-lightbox__thumb-btn ${isActive ? 'is-active' : ''}`}
                  style={{
                    borderColor: isActive ? accentColor : 'transparent',
                    boxShadow: isActive ? `0 0 12px ${accentColor}60` : 'none',
                  }}
                  data-cursor="link"
                  aria-label={`${t('projects.view')} ${i + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-14 h-9 sm:w-16 sm:h-10 object-cover rounded-lg"
                    loading="lazy"
                  />
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>,
    document.body
  );
}
