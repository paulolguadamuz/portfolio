import {
  FiGithub,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useLang } from '../i18n/LanguageContext';

const SOCIALS = [
  {
    icon: FiGithub,
    href: 'https://github.com/paulolguadamuz',
    label: 'GitHub',
  },
  {
    icon: FiLinkedin,
    href: 'https://www.linkedin.com/in/paulolgdmz/',
    label: 'LinkedIn',
  },
  {
    icon: FiInstagram,
    href: 'https://www.instagram.com/paulo.tgz/',
    label: 'Instagram',
  },
  {
    icon: FaWhatsapp,
    href: 'https://wa.me/50687397574',
    label: 'WhatsApp',
  },
];

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="relative border-t border-light/10 py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">
          {/* Brand + CTA */}
          <div className="flex flex-col gap-4">
            <h3 className="font-display font-bold text-2xl text-light tracking-tight">
              Paulo Jimenez Guadamuz
            </h3>
            <p className="font-body text-sm text-light/40 leading-relaxed">
            </p>
            <a
              href="https://github.com/paulolguadamuz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 font-body text-sm uppercase tracking-widest px-6 py-3 border border-light/20 rounded-full text-light hover:bg-light hover:text-dark transition-all duration-300 text-center w-fit"
            >
              {t('footer.cta')}
            </a>
          </div>

          {/* Contact info */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-light/60 mb-2">
              {t('footer.contact_title')}
            </h4>
            <a
              href="mailto:paujigua@gmail.com"
              className="font-body text-sm text-light/70 hover:text-light transition-colors flex items-center gap-2"
            >
              <FiMail className="w-4 h-4" />
              paujigua@gmail.com
            </a>
            <a
              href="tel:+50687397574"
              className="font-body text-sm text-light/70 hover:text-light transition-colors flex items-center gap-2"
            >
              <FiPhone className="w-4 h-4" />
              +506 8739 7574
            </a>
          </div>

          {/* Social icons */}
          <div className="flex flex-col gap-3">
            <h4 className="font-display font-semibold text-sm uppercase tracking-widest text-light/60 mb-2">
              {t('footer.socials_title')}
            </h4>
            <div className="flex items-center gap-4">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full border border-light/10 flex items-center justify-center text-light/50 hover:text-light hover:border-light/30 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-light/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-light/30">
            © {new Date().getFullYear()} Paulo Jimenez Guadamuz. {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
