const translations = {
  es: {
    // Navbar
    nav: {
      home: 'Inicio',
      skills: 'Skills',
      projects: 'Proyectos',
      contact: 'Contacto',
      aria_label: 'Navegación principal',
      toggle_menu: 'Abrir o cerrar el menú',
    },

    // Hero
    hero: {
      subtitle: 'Ingeniero TI , Desarrollador Web, UI/UX Designer.',
      bio: 'Soy un ingeniero en tecnologías de información con experiencia en desarrollo web, diseño de interfaces, ciberseguridad y soluciones tecnológicas. Me especializo en crear soluciones eficientes y escalables para empresas y organizaciones.',
      cta_projects: 'Ver proyectos',
      cta_contact: 'Contacto',
      scroll_cue: 'Desliza',
    },

    // Projects
    projects: {
      title: 'Proyectos',
      cta_github: 'Ver más proyectos en GitHub',
      close: 'Cerrar',
      view: 'vista',
      descriptions: {
        1: 'Sitio web corporativo para un equipo de desarrollo de software, diseñado para presentar proyectos, mostrar al equipo y captar clientes. Construido con React, JavaScript y Lenis para una experiencia de scroll fluida y profesional.',
        2: 'E-commerce de café de especialidad con catálogo interactivo, carrito moderno y pasarelas de pago integradas (PayPal y SINPE). Incluye secciones de about, contacto y una experiencia de compra enfocada en transmitir la identidad artesanal de la marca.',
        3: 'Plataforma de gestión de mantenimiento industrial para pequeñas fábricas. Permite a los operarios reportar fallas escaneando un QR en cada máquina y genera recordatorios automáticos de revisiones preventivas, eliminando el caos de WhatsApp y minimizando paros en la línea de producción.',
        4: 'Plataforma online del Juego de mesa estilo Calabozos y Dragones (D&D), con perfiles de personaje, inventario interactivo, compendio de conjuros, comercio en tiempo real, gremios y pasarela de pagos PayPal. Construida con Next.js, TypeScript, Supabase (PostgreSQL + RLS) y Tailwind CSS.',
      },
      tags: {
        'Catálogo': 'Catálogo',
        'Mantenimiento': 'Mantenimiento',
        'Automatización': 'Automatización',
      },
      visit_site: 'Visitar sitio',
      private_saas: 'SaaS Privado — Acceso Restringido',
      case_study: 'Ver caso de estudio',
      case_study_active: 'Caso abierto',
    },

    // Contact
    contact: {
      heading_1: 'Hábleme',
      heading_2: 'de su idea.',
      subtext: '¿Tiene algún proyecto en mente? Me encantaría escuchar su idea y explorar cómo puedo ayudarle a hacerla realidad. Contácteme y empecemos a trabajar.',
      label_name: 'Nombre',
      label_email: 'Email',
      label_message: 'Mensaje',
      placeholder_name: 'Tu nombre',
      placeholder_email: 'tu@email.com',
      placeholder_message: 'Cuéntame sobre tu proyecto...',
      submit: 'Enviar mensaje',
      sending: 'Enviando...',
      success: '¡Mensaje enviado con éxito!',
      error_fields: 'Por favor completa todos los campos.',
      error_name: 'El nombre debe tener al menos 2 caracteres.',
      error_email: 'Por favor ingresa un email válido.',
      error_message: 'El mensaje debe tener al menos 10 caracteres.',
      error_send: 'Error al enviar el mensaje. Inténtalo de nuevo.',
      error_connection: 'Error de conexión. Inténtalo más tarde.',
    },

    // Footer
    footer: {
      cta: 'Ver más proyectos',
      contact_title: 'Contacto',
      socials_title: 'Redes',
      rights: 'Todos los derechos reservados.',
    },

    // Skills
    skills: {
      title: 'Habilidades',
      items: {
        dotnet: {
          name: '.NET',
          desc: 'Desarrollo de backend robusto, APIs REST de alto rendimiento, microservicios y arquitectura limpia empresarial con C# y .NET 8.',
        },
        react: {
          name: 'React',
          desc: 'Desarrollo de interfaces dinámicas con componentes reutilizables, hooks y gestión de estado para aplicaciones web de alto rendimiento.',
        },
        javascript: {
          name: 'JavaScript',
          desc: 'Dominio completo del lenguaje — ES6+, asincronía, manipulación del DOM y desarrollo tanto en frontend como en backend con Node.js.',
        },
        typescript: {
          name: 'TypeScript',
          desc: 'Tipado estático para proyectos escalables, interfaces robustas y mejor experiencia de desarrollo en equipos.',
        },
        tailwind: {
          name: 'Tailwind CSS',
          desc: 'Maquetación ágil con utility-first, diseño responsivo y sistemas de diseño consistentes sin CSS redundante.',
        },
        nextjs: {
          name: 'Next.js',
          desc: 'Creación de aplicaciones web optimizadas, renderizado del lado del servidor (SSR) y generación de sitios estáticos (SSG).',
        },
        sql: {
          name: 'SQL',
          desc: 'Modelado de bases de datos relacionales, consultas complejas, optimización de rendimiento y migraciones con PostgreSQL y MySQL.',
        },
        python: {
          name: 'Python',
          desc: 'Automatización de procesos, scripting, análisis de datos y desarrollo de APIs con frameworks como Flask y FastAPI.',
        },
      },
    },

    // WhatsApp
    whatsapp: {
      label: 'Contactar por WhatsApp',
    },

    // Mea Culpa Showcase
    meaculpa: {
      label: 'Caso de estudio',
      heading: 'Dentro de Mea Culpa',
      intro: 'Plataforma interactiva full-stack para la gestión integral de campañas y personajes del Juego de mesa estilo Calabozos y Dragones (D&D), con arquitectura moderna, base de datos segura y funcionalidades en tiempo real.',
      features: {
        characters: {
          title: 'Gestión de Personajes',
          desc: 'Perfiles con progresión hasta nivel 20, inventario inteligente con bolsas dinámicas, equipamiento con ranuras (armas, capas, anillos) y seguimiento de signos vitales.',
        },
        spells: {
          title: 'Compendio de Conjuros',
          desc: 'Base de datos interactiva con cientos de hechizos, buscador avanzado por escuela/nivel y sistema de validación de conjuros por personaje.',
        },
        commerce: {
          title: 'Economía y Comercio',
          desc: 'Sistema transaccional con auditoría completa (RLS), tiendas con catálogos dinámicos, mercado en tiempo real y gremios con baúles compartidos.',
        },
        sessions: {
          title: 'Salas en Tiempo Real',
          desc: 'Salas interactivas para DMs y jugadores con sincronización de eventos, módulo visual de dados y tablas de recompensas automáticas.',
        },
      },
      contrib_label: 'Mi rol',
      contrib_heading: 'Contribuciones al Proyecto',
      contributions: {
        profiles: {
          title: 'Perfiles de Personaje',
          desc: 'Diseño e implementación de la ficha de personaje, inventario interactivo, sistema de equipamiento y visualización de estados vitales.',
        },
        spells_module: {
          title: 'Módulo de Conjuros',
          desc: 'Construcción del compendio interactivo con filtros avanzados por escuela y nivel, además del sistema de asignación de hechizos.',
        },
        bugfix: {
          title: 'Bugfixing y Optimización',
          desc: 'Diagnóstico y corrección de errores en flujos críticos frontend/backend, mejorando estabilidad transaccional y sincronización con Supabase.',
        },
        support: {
          title: 'Soporte a Clientes',
          desc: 'Asistencia técnica directa a usuarios y directores de juego, resolución de incidencias en partidas y soporte en vivo durante eventos.',
        },
      },
      stack: {
        title: 'Stack Tecnológico',
        integrations_label: 'Integraciones',
        frontend: 'Next.js (App Router), React, TypeScript, Tailwind CSS, CSS Modular.',
        backend: 'Supabase (PostgreSQL, Row Level Security, RPC/Funciones SQL), Next.js API Routes.',
        integrations: 'PayPal SDK / Webhooks, Nivel20 API, módulo de tiradas procedurales.',
      },
      cta: 'Explorar Mea Culpa',
      close: 'Cerrar caso',
    },

    // NovaSite Showcase
    novasite: {
      label: 'Caso de estudio',
      heading: 'Dentro de NovaSite',
      intro: 'Sitio web corporativo para NovaSite, un estudio de desarrollo de software, construido con Next.js 15, React 19, TypeScript y Tailwind CSS. Incluye landing page, secciones de servicios, proyectos, sobre nosotros y contacto, con un sistema de envío de correos integrado.',
      features: {
        carousel: {
          title: 'Carrusel de Integrantes',
          desc: 'Sección "equipo" con carrusel responsive: versión táctil/mobile y versión 3D tipo coverflow en desktop, con pausa automática al interactuar (hover / touch).',
        },
        animations: {
          title: 'Animaciones con GSAP',
          desc: 'Efectos de scroll (ScrollTrigger), animaciones de texto en el hero, botones magnéticos y transiciones de hover en tarjetas de proyectos, integrados vía @gsap/react.',
        },
        contact: {
          title: 'Apartado de Contacto',
          desc: 'Formulario funcional con validaciones y protección anti-spam mediante Cloudflare Turnstile.',
        },
        email: {
          title: 'Envío Automático de Correos',
          desc: 'Endpoint POST /api/contact que valida los datos, verifica el captcha y envía el mensaje por correo usando Nodemailer (Gmail).',
        },
      },
      contrib_label: 'Mi rol',
      contrib_heading: 'Mi Aporte (Front-end)',
      contributions: {
        carousel_impl: {
          title: 'Carrusel de Equipo',
          desc: 'Implementación del carrusel responsive con versión táctil para mobile y efecto coverflow 3D en desktop, con pausa automática al interactuar.',
        },
        gsap_anims: {
          title: 'Animaciones GSAP',
          desc: 'Desarrollo de efectos de scroll con ScrollTrigger, animaciones de texto en el hero, botones magnéticos y transiciones de hover en tarjetas.',
        },
        contact_form: {
          title: 'Formulario de Contacto',
          desc: 'Formulario funcional con validaciones completas y protección anti-spam integrada con Cloudflare Turnstile.',
        },
        social: {
          title: 'Redes Sociales',
          desc: 'Botones de contacto directo (WhatsApp, Instagram) integrados en el layout del sitio.',
        },
      },
      stack: {
        title: 'Stack Tecnológico',
        integrations_label: 'Integraciones',
        frontend: 'Next.js 15, React 19, TypeScript, Tailwind CSS, GSAP (@gsap/react).',
        backend: 'Next.js API Routes, Nodemailer (Gmail SMTP).',
        integrations: 'Cloudflare Turnstile, WhatsApp API, Instagram.',
      },
      cta: 'Explorar NovaSite',
      close: 'Cerrar caso',
    },
  },

  en: {
    // Navbar
    nav: {
      home: 'Home',
      skills: 'Skills',
      projects: 'Projects',
      contact: 'Contact',
      aria_label: 'Main navigation',
      toggle_menu: 'Toggle menu',
    },

    // Hero
    hero: {
      subtitle: 'IT Engineer, Web Developer, UI/UX Designer.',
      bio: 'I am an information technology engineer with experience in web development, interface design, cybersecurity and technology solutions. I specialize in creating efficient and scalable solutions for companies and organizations.',
      cta_projects: 'View projects',
      cta_contact: 'Contact',
      scroll_cue: 'Scroll',
    },

    // Projects
    projects: {
      title: 'Projects',
      cta_github: 'View more projects on GitHub',
      close: 'Close',
      view: 'view',
      descriptions: {
        1: 'Corporate website for a software development team, designed to showcase projects, present the team and attract clients. Built with React, JavaScript and Lenis for a smooth and professional scrolling experience.',
        2: 'Specialty coffee e-commerce with interactive catalog, modern cart and integrated payment gateways (PayPal & SINPE). Includes about, contact sections and a shopping experience focused on conveying the artisan brand identity.',
        3: 'Industrial maintenance management platform for small factories. Allows operators to report failures by scanning a QR code on each machine and generates automatic reminders for preventive reviews, eliminating WhatsApp chaos and minimizing production line stoppages.',
        4: 'Online platform for the Dungeons & Dragons-style board game, featuring character profiles, interactive inventory, spell compendium, real-time trading, guilds, and PayPal payment gateway. Built with Next.js, TypeScript, Supabase (PostgreSQL + RLS) and Tailwind CSS.',
      },
      tags: {
        'Catálogo': 'Catalog',
        'Mantenimiento': 'Maintenance',
        'Automatización': 'Automation',
      },
      visit_site: 'Visit site',
      private_saas: 'Private SaaS — Restricted Access',
      case_study: 'View case study',
      case_study_active: 'Case open',
    },

    // Contact
    contact: {
      heading_1: 'Tell me',
      heading_2: 'about your idea.',
      subtext: 'Do you have a project in mind? I would love to hear your idea and explore how I can help you make it a reality. Reach out and let\'s get to work.',
      label_name: 'Name',
      label_email: 'Email',
      label_message: 'Message',
      placeholder_name: 'Your name',
      placeholder_email: 'you@email.com',
      placeholder_message: 'Tell me about your project...',
      submit: 'Send message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      error_fields: 'Please fill in all fields.',
      error_name: 'Name must be at least 2 characters.',
      error_email: 'Please enter a valid email address.',
      error_message: 'Message must be at least 10 characters.',
      error_send: 'Error sending message. Please try again.',
      error_connection: 'Connection error. Please try again later.',
    },

    // Footer
    footer: {
      cta: 'View more projects',
      contact_title: 'Contact',
      socials_title: 'Social',
      rights: 'All rights reserved.',
    },

    // Skills
    skills: {
      title: 'Skills',
      items: {
        dotnet: {
          name: '.NET',
          desc: 'Building robust backend systems, high-performance REST APIs, microservices, and enterprise clean architecture using C# and .NET 8.',
        },
        react: {
          name: 'React',
          desc: 'Building dynamic interfaces with reusable components, hooks and state management for high-performance web applications.',
        },
        javascript: {
          name: 'JavaScript',
          desc: 'Full command of the language — ES6+, async patterns, DOM manipulation and development on both frontend and backend with Node.js.',
        },
        typescript: {
          name: 'TypeScript',
          desc: 'Static typing for scalable projects, robust interfaces and improved developer experience in team environments.',
        },
        tailwind: {
          name: 'Tailwind CSS',
          desc: 'Rapid utility-first layouts, responsive design and consistent design systems without redundant CSS.',
        },
        nextjs: {
          name: 'Next.js',
          desc: 'Building optimized web applications, server-side rendering (SSR), and static site generation (SSG).',
        },
        sql: {
          name: 'SQL',
          desc: 'Relational database modeling, complex queries, performance optimization and migrations with PostgreSQL and MySQL.',
        },
        python: {
          name: 'Python',
          desc: 'Process automation, scripting, data analysis and API development with frameworks like Flask and FastAPI.',
        },
      },
    },

    // WhatsApp
    whatsapp: {
      label: 'Contact via WhatsApp',
    },

    // Mea Culpa Showcase
    meaculpa: {
      label: 'Case study',
      heading: 'Inside Mea Culpa',
      intro: 'Full-stack interactive platform for comprehensive campaign and character management of the D&D style board game, featuring modern architecture, secure database, and real-time capabilities.',
      features: {
        characters: {
          title: 'Character Management',
          desc: 'Profiles with progression up to level 20, smart inventory with dynamic bags, equipment slots (weapons, cloaks, rings) and vital signs tracking.',
        },
        spells: {
          title: 'Spell Compendium',
          desc: 'Interactive database with hundreds of spells, advanced search by school/level and per-character spell validation system.',
        },
        commerce: {
          title: 'Economy & Trading',
          desc: 'Transactional system with full audit trail (RLS), shops with dynamic catalogs, real-time marketplace and guilds with shared vaults.',
        },
        sessions: {
          title: 'Real-Time Sessions',
          desc: 'Interactive rooms for DMs and players with event sync, visual dice module and automatic loot reward tables.',
        },
      },
      contrib_label: 'My role',
      contrib_heading: 'Project Contributions',
      contributions: {
        profiles: {
          title: 'Character Profiles',
          desc: 'Design and implementation of character sheets, interactive inventory, equipment system and vital state visualization.',
        },
        spells_module: {
          title: 'Spell Module',
          desc: 'Built the interactive compendium with advanced school/level filters and spell assignment system.',
        },
        bugfix: {
          title: 'Bugfixing & Optimization',
          desc: 'Diagnosis and resolution of critical frontend/backend bugs, improving transactional stability and Supabase sync.',
        },
        support: {
          title: 'Client Support',
          desc: 'Direct technical assistance to users and game masters, incident resolution during sessions and live event support.',
        },
      },
      stack: {
        title: 'Tech Stack',
        integrations_label: 'Integrations',
        frontend: 'Next.js (App Router), React, TypeScript, Tailwind CSS, Modular CSS.',
        backend: 'Supabase (PostgreSQL, Row Level Security, RPC/SQL Functions), Next.js API Routes.',
        integrations: 'PayPal SDK / Webhooks, Nivel20 API, procedural dice roll module.',
      },
      cta: 'Explore Mea Culpa',
      close: 'Close case',
    },

    // NovaSite Showcase
    novasite: {
      label: 'Case study',
      heading: 'Inside NovaSite',
      intro: 'Corporate website for NovaSite, a software development studio, built with Next.js 15, React 19, TypeScript and Tailwind CSS. Includes a landing page, services, projects, about us and contact sections, with an integrated email system.',
      features: {
        carousel: {
          title: 'Team Carousel',
          desc: 'Team section with responsive carousel: touch/mobile version and 3D coverflow-style version on desktop, with auto-pause on interaction (hover / touch).',
        },
        animations: {
          title: 'GSAP Animations',
          desc: 'Scroll effects (ScrollTrigger), hero text animations, magnetic buttons and project card hover transitions, integrated via @gsap/react.',
        },
        contact: {
          title: 'Contact Section',
          desc: 'Functional form with validations and anti-spam protection via Cloudflare Turnstile.',
        },
        email: {
          title: 'Automatic Email Sending',
          desc: 'POST /api/contact endpoint that validates data, verifies the captcha and sends the message via email using Nodemailer (Gmail).',
        },
      },
      contrib_label: 'My role',
      contrib_heading: 'My Contribution (Front-end)',
      contributions: {
        carousel_impl: {
          title: 'Team Carousel',
          desc: 'Implementation of the responsive carousel with touch version for mobile and 3D coverflow effect on desktop, with auto-pause on interaction.',
        },
        gsap_anims: {
          title: 'GSAP Animations',
          desc: 'Development of scroll effects with ScrollTrigger, hero text animations, magnetic buttons and card hover transitions.',
        },
        contact_form: {
          title: 'Contact Form',
          desc: 'Functional form with comprehensive validations and anti-spam protection integrated with Cloudflare Turnstile.',
        },
        social: {
          title: 'Social Media',
          desc: 'Direct contact buttons (WhatsApp, Instagram) integrated into the site layout.',
        },
      },
      stack: {
        title: 'Tech Stack',
        integrations_label: 'Integrations',
        frontend: 'Next.js 15, React 19, TypeScript, Tailwind CSS, GSAP (@gsap/react).',
        backend: 'Next.js API Routes, Nodemailer (Gmail SMTP).',
        integrations: 'Cloudflare Turnstile, WhatsApp API, Instagram.',
      },
      structure: {
        title: 'Project Structure',
        files: {
          page: {
            path: 'src/app/page.tsx',
            desc: 'Landing page — hero, team carousel, projects, GSAP animations.',
          },
          contacto: {
            path: 'src/app/contacto/',
            desc: 'Contact page with form and validations.',
          },
          servicios: {
            path: 'src/app/servicios/',
            desc: 'Services offered by the studio.',
          },
          proyectos: {
            path: 'src/app/proyectos/',
            desc: 'Team project portfolio.',
          },
          sobre_nosotros: {
            path: 'src/app/sobre-nosotros/',
            desc: 'Team and company information.',
          },
          api: {
            path: 'src/app/api/contact/route.ts',
            desc: 'API route for automatic email sending.',
          },
        },
      },
      cta: 'Explore NovaSite',
      close: 'Close case',
    },
  },
};

export default translations;
