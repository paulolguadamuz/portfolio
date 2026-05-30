import { FaWhatsapp } from 'react-icons/fa';
import { useLang } from '../i18n/LanguageContext';

export default function FloatingWhatsApp() {
  const { t } = useLang();

  return (
    <a
      href="https://wa.me/50687397574"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('whatsapp.label')}
      className="whatsapp-pulse fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
      style={{ backgroundColor: '#25D366' }}
    >
      <FaWhatsapp className="w-7 h-7 text-white" />
    </a>
  );
}
