import { forwardRef, useState } from 'react';
import { LuMonitor, LuSmartphone } from 'react-icons/lu';
import { useLang } from '../i18n/LanguageContext';

const ApseDevicePreview = forwardRef(function ApseDevicePreview({ project, onImageClick }, ref) {
  const { t } = useLang();
  const [device, setDevice] = useState('desktop');
  const images = project.devicePreviews[device];
  const lightboxProject = { ...project, image: images[0], gallery: images.slice(1) };

  return (
    <div ref={ref} className="apse-preview" style={{ '--apse-accent': project.palette.accent }}>
      <div className="apse-preview__switch" role="group" aria-label={t('projects.device_preview')}>
        <button
          type="button"
          className={device === 'desktop' ? 'is-active' : ''}
          aria-pressed={device === 'desktop'}
          onClick={() => setDevice('desktop')}
        >
          <LuMonitor aria-hidden="true" />
          <span>{t('projects.desktop_view')}</span>
        </button>
        <button
          type="button"
          className={device === 'mobile' ? 'is-active' : ''}
          aria-pressed={device === 'mobile'}
          onClick={() => setDevice('mobile')}
        >
          <LuSmartphone aria-hidden="true" />
          <span>{t('projects.mobile_view')}</span>
        </button>
      </div>

      <div className={`apse-preview__stage is-${device}`}>
        {['desktop', 'mobile'].map((mode) => (
          <button
            key={mode}
            type="button"
            className={`apse-preview__device apse-preview__device--${mode}`}
            tabIndex={device === mode ? 0 : -1}
            aria-hidden={device !== mode}
            aria-label={`${t('projects.view')} ${project.title} ${t(`projects.${mode === 'desktop' ? 'desktop_view' : 'mobile_view'}`)}`}
            onClick={() => onImageClick(lightboxProject, 0)}
            data-cursor="view"
          >
            <img
              src={project.devicePreviews[mode][0]}
              alt=""
              width={mode === 'desktop' ? 1912 : 782}
              height={mode === 'desktop' ? 926 : 1594}
              loading={mode === 'desktop' ? 'eager' : 'lazy'}
              decoding="async"
            />
          </button>
        ))}
      </div>

      <button
        type="button"
        className="apse-preview__secondary"
        onClick={() => onImageClick(lightboxProject, 1)}
        aria-label={`${t('projects.view')} ${project.title} 2`}
        data-cursor="view"
      >
        <img src={images[1]} alt="" loading="lazy" decoding="async" />
        <span>{t(`projects.${device === 'desktop' ? 'trip_history' : 'report'}`)}</span>
      </button>
    </div>
  );
});

export default ApseDevicePreview;
