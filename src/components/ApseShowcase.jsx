import { LuFileText, LuReceipt, LuRoute, LuUsers, LuX } from 'react-icons/lu';
import { useLang } from '../i18n/LanguageContext';

const features = [
  { key: 'routes', icon: LuRoute },
  { key: 'expenses', icon: LuReceipt },
  { key: 'reports', icon: LuFileText },
  { key: 'admin', icon: LuUsers },
];

export default function ApseShowcase({ onClose }) {
  const { t } = useLang();

  return (
    <section className="apse-case max-w-6xl mx-auto px-6 lg:px-8 py-20 lg:py-28">
      <div className="flex items-start justify-between gap-6 mb-14">
        <div>
          <p className="apse-case__eyebrow">{t('apse.label')}</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-white mb-5">
            {t('apse.heading')}
          </h2>
          <p className="font-body text-base sm:text-lg leading-relaxed max-w-3xl text-white/75">
            {t('apse.intro')}
          </p>
        </div>
        <button type="button" onClick={onClose} className="apse-case__close" aria-label={t('projects.close')}>
          <LuX className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-14">
        {features.map(({ key, icon: Icon }) => (
          <article key={key} className="apse-case__feature">
            <Icon className="w-6 h-6 mb-5" aria-hidden="true" />
            <h3 className="font-display font-semibold text-lg sm:text-xl text-white mb-2">
              {t(`apse.features.${key}.title`)}
            </h3>
            <p className="font-body text-sm sm:text-base leading-relaxed text-white/70">
              {t(`apse.features.${key}.desc`)}
            </p>
          </article>
        ))}
      </div>

      <div className="apse-case__architecture">
        <p className="apse-case__eyebrow">{t('apse.architecture_label')}</p>
        <p className="font-body text-base sm:text-lg leading-relaxed text-white/75 max-w-4xl">
          {t('apse.architecture')}
        </p>
      </div>
    </section>
  );
}
