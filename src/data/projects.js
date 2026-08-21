export const projects = [
  {
    id: 1,
    title: "Novasite",
    description:
      "Sitio web corporativo para un equipo de desarrollo de software, diseñado para presentar proyectos, mostrar al equipo y captar clientes. Construido con React, JavaScript y Lenis para una experiencia de scroll fluida y profesional.",
    image: "/projects/NovasiteHomeScreen.webp",
    gallery: [
      "/projects/NovasiteProjects.webp",
      "/projects/NovasiteMembers.webp",
      "/projects/NovasiteContact.webp",
    ],
    tags: ["Next.js", "TypeScript", "Tailwind CSS"],
    url: "https://www.novacr.site",
    palette: {
      from: "#09090A",
      to: "#015393",
      accent: "#53A3E2",
      surface: "#FFFEFE",
    },
  },
  {
    id: 2,
    title: "Bougainvillea",
    description:
      "E-commerce de café de especialidad con catálogo interactivo, carrito moderno y pasarelas de pago integradas (PayPal y SINPE). Incluye secciones de about, contacto y una experiencia de compra enfocada en transmitir la identidad artesanal de la marca.",
    image: "/projects/BougainVilleaHomescreen.webp",
    gallery: [
      "/projects/BougainVilleaCatalog.webp",
      "/projects/BougainVilleaContactBurgerMenu.webp",
    ],
    tags: ["React", "E-commerce"],
    url: "https://bougan-villea.vercel.app/",
    palette: {
      from: "#4E0D33",
      to: "#C12880",
      accent: "#F365B3",
      surface: "#FFFFFF",
    },
  },
  {
    id: 3,
    title: "MantenTools",
    description:
      "Plataforma de gestión de mantenimiento industrial para pequeñas fábricas. Permite a los operarios reportar fallas escaneando un QR en cada máquina y genera recordatorios automáticos de revisiones preventivas, eliminando el caos de WhatsApp y minimizando paros en la línea de producción.",
    image: "/projects/mantentoolsDashBoard.webp",
    gallery: [
      "/projects/mantentoolsGraphs.webp",
      "/projects/mantentoolsUsers.webp",
      "/projects/MantentoolsCheck.webp",
    ],
    tags: ["SaaS", "Automatización"],
    isPrivate: true,
    palette: {
      from: "#162033",
      to: "#0D172A",
      accent: "#A8AFBA",
      surface: "#F0F5F9",
    },
  },
  {
    id: 4,
    title: "Mea Culpa",
    description:
      "Plataforma online del Juego de mesa estilo Calabozos y Dragones (D&D), con perfiles de personaje, inventario interactivo, compendio de conjuros, comercio en tiempo real, gremios y pasarela de pagos PayPal. Construida con Next.js, TypeScript, Supabase (PostgreSQL + RLS) y Tailwind CSS.",
    image: "/projects/HomepageMeaCulpa.webp",
    gallery: [
      "/projects/PersonajeMeaCulpa.webp",
      "/projects/ConjurosMeaCulpa.webp",
    ],
    tags: ["Next.js", "TypeScript", "Supabase"],
    url: "https://www.meaculpadnd.com",
    palette: {
      from: "#1A1108",
      to: "#2C1A0A",
      accent: "#D4A636",
      surface: "#F5E6C8",
    },
  },
];
