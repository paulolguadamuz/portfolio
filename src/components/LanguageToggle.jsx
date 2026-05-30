import { useLang } from '../i18n/LanguageContext';

export default function LanguageToggle() {
  const { lang, toggleLang } = useLang();
  const isEN = lang === 'en';

  return (
    <button
      onClick={toggleLang}
      aria-label="Toggle language"
      className="relative flex items-center w-16 h-8 rounded-full bg-light/10 backdrop-blur-md border border-light/10 shadow-sm p-1 cursor-pointer transition-all hover:border-light/30 group"
    >
      <div
        className="absolute h-6 w-7 bg-light rounded-full shadow-md transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: isEN ? 'translateX(calc(100% + 2px))' : 'translateX(0)' }}
      />
      <span
        className={`relative z-10 flex-1 text-center font-body text-[10px] font-bold tracking-widest transition-colors duration-300 ${
          !isEN ? 'text-dark' : 'text-light/40 group-hover:text-light/70'
        }`}
      >
        ES
      </span>
      <span
        className={`relative z-10 flex-1 text-center font-body text-[10px] font-bold tracking-widest transition-colors duration-300 ${
          isEN ? 'text-dark' : 'text-light/40 group-hover:text-light/70'
        }`}
      >
        EN
      </span>
    </button>
  );
}
