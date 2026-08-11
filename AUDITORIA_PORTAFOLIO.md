# Auditoría de diseño y animación — Portafolio Paulo Jiménez

**Fecha:** 3 de agosto de 2026
**Alcance:** código del repositorio + sitio en producción `https://www.paulojimenez.blog` + render local (`vite dev`, 127.0.0.1:5173)
**Commit auditado:** `77613d2`
**Naturaleza:** auditoría (fase 1) + implementación (fase 2, 3 ago 2026). Ver §0.

---

## 0. Estado de implementación

Decisiones recibidas: **idioma por defecto = inglés**; **lado derecho del hero = vacío por ahora**.
Ninguna dependencia nueva instalada. Verificado con build de producción, tabulación real por teclado, contraste calculado y emulación de `prefers-reduced-motion`.

| Bloque | Estado | Resultado medido |
|---|---|---|
| A1 · reduced-motion | ✅ | 0 → 1 bloque CSS + 7 contextos `gsap.matchMedia`; Lenis no se instancia; 0 tweens activos con `reduce` |
| A2 · sin `filter: blur()` animado | ✅ | 25 → **0** (solo quedan 2 glows decorativos estáticos) |
| A3 · fondo compuesto | ✅ | `body` estático; 5 capas fijas con `opacity`; sin `transition: background` en competencia |
| A4 · accesibilidad | ✅ | 16/16 elementos tabulados con foco visible; `aria-live`, `aria-expanded`, `role="dialog"` + focus trap, skip link |
| A5 · compartición y SEO | ✅ | `og:`/`twitter:`/canonical; `robots.txt` y `sitemap.xml`; `lang` sincronizado con el toggle |
| A6 · imágenes y caché | ✅ | **4.72 MB → 0.53 MB (-89%)** en WebP; favicon 351 KB → 12 KB; `width`/`height` en 14/14; `vercel.json` |
| M1 · SplitText | ✅ | Dos splitters manuales eliminados; `will-change` permanente 12 → 5 elementos |
| M3 · tipografía Skills | ✅ | 4 → 3 familias (`monospace` fuera); `select-none` fuera; Skills en el nav |
| M4 · navbar legible | ✅ | Scrim degradado + barra sólida al hacer scroll |
| M5 · scroll unificado | ✅ | `scrollIntoView` nativo eliminado; `scroll-margin-top` en secciones |
| B1–B4 · limpieza y layout | ✅ | Fuente sin usar fuera, fuga del ticker corregida, `direction:rtl` → `order`, indicador de scroll, altura 7933 → 7085 px |
| **M2 · hero (lado derecho)** | ⏸️ | Omitido a petición tuya. Sí se añadió el indicador de scroll (H3) |
| **M6 · Flip en casos de estudio** | ❌ | **No implementado.** Ver nota abajo |
| **B5 · CSS scroll-driven** | ❌ | Bloqueado por la pregunta 14 (analíticas / navegadores reales) |

**Por qué no hice M6.** Es el refactor de mayor riesgo del informe y su beneficio es el menos seguro: `Flip` está pensado para mover y redimensionar elementos entre estados existentes, no para expandir un contenedor desde altura cero con contenido de altura variable, que es lo que hace el caso de estudio. Reescribirlo tocaría la orquestación más delicada del sitio (`useImperativeHandle` + doble `requestAnimationFrame` + `ScrollTrigger.refresh`) sin garantía de mejora. Preferí dejarlo funcionando y decírtelo, en vez de dejarlo a medias. El riesgo de INP que motivaba M6 sigue abierto y conviene medirlo en Chrome real antes de decidir.

**Cambios que conviene que revises:**
- Los 14 PNG de `public/projects/` fueron **eliminados** tras convertirlos a WebP. Están en el historial de git, así que revertir es `git checkout HEAD -- public/projects`.
- `public/og-cover.png` (1200×630) fue **generado** con el propio sistema tipográfico del sitio. Es un punto de partida razonable; si tienes una pieza de marca propia, sustitúyela.
- `public/me.png` (143 KB) **sigue sin usarse**. No lo borré porque dijiste que el lado derecho del hero está vacío "por el momento".
- El formulario ahora usa `noValidate`: `type="email"` da el teclado correcto en móvil, pero la validación visible sigue siendo la tuya, traducida, en vez del tooltip nativo del navegador.

### Rendimiento tras los cambios

Mismo método que la medición inicial (headless, `--disable-gpu`, scroll programado de 40 pasos), así que sigue valiendo el caveat de §5.1: **compara solo contra sí mismo**.

| | Antes | Después |
|---|---|---|
| FPS aproximado | 40.1 | **45.9** |
| Tareas largas | 0 | 0 |
| Altura del documento | 7933 px | 7085 px |
| `will-change` permanente | 12 elementos | 5 (las capas de fondo, justificadas) |
| Peso de `public/` | 5.3 MB | **864 KB** |
| Errores de consola | 0 | 0 |

Sigue pendiente medir en Chrome real con el panel Performance y throttling de CPU 4×.

---

### Cómo se obtuvo la evidencia

| Fuente | Método |
|---|---|
| Código | Lectura completa de los 21 archivos de `src/`, `api/`, `index.html` y configs |
| Producción | `curl` sobre `paulojimenez.blog` (HTML, cabeceras, tamaños de assets, `robots.txt`, `sitemap.xml`) |
| Render real | Chrome headless vía CDP sobre el dev server: 12 capturas (desktop 1440×900 y móvil 390×844), métricas de DOM, contraste calculado y muestreo de FPS |
| Referencias | Fichas oficiales de Awwwards (premio, fecha, puntuación y tecnologías declaradas) + HTML de los sitios |

> Todo dato marcado **[no verificado]** requiere tu confirmación antes de actuar sobre él.

---

## 1. Resumen ejecutivo

El portafolio tiene una base de animación seria y bien montada: GSAP + ScrollTrigger + Lenis correctamente integrados, con `gsap.context()` y limpieza en cada componente. El problema no es la falta de movimiento, sino **dónde se gasta**: 25 animaciones dependen de `filter: blur()` y el fondo repinta la página completa en cada frame de scroll, mientras que el sitio no tiene ni una sola regla `prefers-reduced-motion`, ni indicador de foco visible en la navegación, ni etiquetas `og:` para compartir el enlace. Visualmente, el layout desperdicia entre el 40 % y el 45 % del ancho en desktop y el sistema tipográfico se rompe con un `monospace` suelto en Skills. **El hallazgo con mayor retorno: GSAP 3.15.0 ya trae SplitText, Flip, ScrollSmoother, DrawSVG y MorphSVG instalados en `node_modules` — capacidades premium disponibles hoy, a coste cero, que el sitio no usa.**

---

## 2. Fortalezas actuales (conservar)

1. **Integración GSAP↔Lenis hecha como se debe.** `lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker` + `lagSmoothing(0)` — [App.jsx:32-39](src/App.jsx#L32-L39). Es el patrón canónico, no una aproximación.
2. **Limpieza de animaciones disciplinada.** Todos los componentes animados usan `gsap.context()` con `ctx.revert()` en el cleanup: [ProjectCard.jsx:23,163](src/components/ProjectCard.jsx#L163), [Skills.jsx:67,165](src/components/Skills.jsx#L165), [Contact.jsx:112,141](src/components/Contact.jsx#L141), [Projects.jsx:42,142](src/components/Projects.jsx#L142). Cero errores en consola en el recorrido completo.
3. **Transición cromática por proyecto.** Cada proyecto interpola el gradiente del `body` hacia su paleta al entrar en viewport ([Projects.jsx:51-117](src/components/Projects.jsx#L51-L117), paletas en [projects.js](src/data/projects.js)). Es una idea fuerte y poco común; verificada en las capturas (el fondo pasa a magenta en Bougainvillea, a ámbar en Mea Culpa).
4. **Casos de estudio expandibles con orquestación real.** El patrón `useImperativeHandle` exponiendo `animateIn()`/`animateOut()` para que el padre encadene los timelines ([MeaCulpaShowcase.jsx:35-129](src/components/MeaCulpaShowcase.jsx#L35-L129), [Projects.jsx:222-226](src/components/Projects.jsx#L222-L226)) está bien pensado. Los casos de estudio son el mayor diferenciador de contenido del sitio.
5. **i18n ES/EN completo y real.** 476 líneas de traducciones cubriendo también los casos de estudio ([translations.js](src/i18n/translations.js)). Muy poco habitual en un portafolio.
6. **Formulario de contacto validado en cliente y servidor.** Sanitización y validación duplicadas a propósito en [Contact.jsx:9-17](src/components/Contact.jsx#L9-L17) y [api/contact.js](api/contact.js). Es el patrón correcto.
7. **Brotli activo en producción.** El bundle JS de 365 KB viaja en 128 KB. Verificado: `content-encoding: br`.
8. **Reveal con `clip-path` en las imágenes de proyecto.** [ProjectCard.jsx:25-38](src/components/ProjectCard.jsx#L25-L38) — direccional según la paridad de la tarjeta. Buen detalle, mantener.

---

## 3. Hallazgos por sección

### 3.1 Global — stack y capacidades desaprovechadas

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| G1 | **GSAP 3.15.0 incluye todos los plugins premium y ninguno se usa.** `SplitText.js` (17 KB), `Flip.js` (49 KB), `ScrollSmoother.js` (41 KB), `DrawSVGPlugin.js` (11 KB), `MorphSVGPlugin.js` (38 KB), `Observer.js` (26 KB), `CustomEase.js` (11 KB), `InertiaPlugin.js` (16 KB) están presentes y completos en `node_modules/gsap/` (no son stubs de prueba: se verificó que no contienen avisos de licencia). En su lugar hay dos splitters de texto escritos a mano. | `ls node_modules/gsap/`; [Hero.jsx:33-50](src/components/Hero.jsx#L33-L50); [Skills.jsx:245-253](src/components/Skills.jsx#L245-L253) | Techo de calidad artificialmente bajo. El splitter manual de Hero no maneja tildes ni ligaduras, no ofrece split por líneas, y hay que mantenerlo. SplitText da masking por línea, `onSplit`, y re-split responsive gratis. |
| G2 | **Cero reglas `prefers-reduced-motion` en todo el repo.** Búsqueda en `src/`, `index.html` y `tailwind.config.js`: 0 coincidencias. Confirmado también en runtime (0 media queries de reduced-motion en las hojas de estilo cargadas). | `grep -rn "prefers-reduced-motion" src/` → vacío | Barrera de accesibilidad real. Un usuario con sensibilidad vestibular recibe glitch cada 4.5 s, blurs, parallax y cambios de fondo sin escape posible. Es también criterio de puntuación en Awwwards. |
| G3 | **Solo existe **una** regla de foco en toda la hoja de estilos: `.form-input:focus`.** Medido en runtime recorriendo 31 elementos focusables: 4 quedan sin ningún indicador visible (botón hamburguesa + los 3 enlaces de navegación). | `a11y.json`; [index.css:139-143](src/index.css#L139-L143) | Navegación por teclado prácticamente invisible. WCAG 2.4.7 incumplido. |
| G4 | **`index.html` declara `lang="es"` pero la app arranca en inglés.** | [index.html:2](index.html#L2) vs [LanguageContext.jsx:7](src/i18n/LanguageContext.jsx#L7) (`useState('en')`). El `lang` nunca se actualiza al alternar idioma. | Los lectores de pantalla pronuncian texto en inglés con fonética española. Afecta también a la indexación por idioma. |
| G5 | **Sin `og:` ni `twitter:` — compartir el enlace no muestra nada.** El `<head>` de producción tiene 5 etiquetas: charset, icon, viewport, description y title. | HTML crudo de `https://www.paulojimenez.blog` (653 bytes) | Un portafolio existe para ser compartido. Hoy, pegado en LinkedIn o WhatsApp, aparece sin imagen ni tarjeta. Es la pérdida de impacto más barata de revertir del informe. |
| G6 | **`robots.txt` y `sitemap.xml` devuelven 404, y el HTML llega con `#root` vacío.** SPA sin prerender: sin JS no hay ni una palabra de contenido. | `curl` → ambos 404; `<div id="root"></div>` vacío | SEO nulo para un sitio cuyo objetivo es ser encontrado. |
| G7 | **Cabecera de caché rota en producción: `public, max-age=0, must-revalidate` incluso para los assets con hash.** | `curl -I .../assets/index-BQ2JBL9B.js` → `cache-control: public, max-age=0, must-revalidate`. No existe `vercel.json` en el repo. | Un archivo con hash de contenido es inmutable por definición; revalidarlo en cada visita es una ida y vuelta desperdiciada por asset, en cada carga. |
| G8 | **4.8 MB de PNG sin optimizar.** 14 capturas, todas PNG. La mayor: `BougainVilleaHomescreen.png` = **1.75 MB** (confirmado en producción). Ninguna en WebP/AVIF. | `du -sh public/projects/`; `curl -I .../projects/BougainVilleaHomescreen.png` | Capturas de pantalla en PNG son el formato equivocado. En AVIF/WebP la misma imagen cae típicamente a una fracción del peso. Combinado con G7, cada visita las revalida. |
| G9 | **Las 14 imágenes carecen de `width`/`height`, y las 14 son `loading="lazy"`.** Medido en runtime: `imgTotal: 14, imgsNoDims: 14, imgsLazy: 14`. | `metrics.json`; [ProjectCard.jsx:193-199](src/components/ProjectCard.jsx#L193-L199) | Sin dimensiones intrínsecas no hay reserva de espacio → CLS. Y `lazy` indiscriminado retrasa la imagen candidata a LCP. |
| G10 | **Se cargan 4 familias tipográficas y una nunca se usa.** El `@import` pide Syne (5 pesos), Space Grotesk (5 pesos), Allura y **Great Vibes**. `Great Vibes` no aparece en ningún otro punto del repo. Además el `@import` va dentro del CSS, sin `preconnect`. | [index.css:1](src/index.css#L1); `grep -rn "Great.Vibes" src/` → solo el import | Petición de fuente desperdiciada, y `@import` dentro de CSS serializa la cadena de descarga (CSS → import → fuente) en lugar de paralelizarla. |
| G11 | **`me.png` (146 KB) se despliega pero no se referencia en ningún sitio.** | `grep -rn "me.png" src/ index.html` → 0 coincidencias; el archivo existe en `public/` y responde 200 en producción | Asset muerto. Además revela que hay una foto disponible y el sitio no la usa (ver 3.2). |
| G12 | **Fuga en el ticker de GSAP.** Se añade una función anónima al ticker y en el cleanup se intenta quitar `lenis.raf`, que es una función distinta. El callback nunca se elimina. | [App.jsx:35-42](src/App.jsx#L35-L42) | En producción el efecto se monta una vez, así que el daño es acotado; en desarrollo con StrictMode y HMR se acumulan callbacks. Corrección de una línea (guardar la función en una variable). |

### 3.2 Hero

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| H1 | **El 40-45 % derecho del viewport está vacío en desktop.** El contenido ocupa la mitad izquierda de una franja `max-w-4xl` dentro de un contenedor `max-w-7xl`; a la derecha no hay nada. | Captura `hero.png` (1440×900); [Hero.jsx:114-115](src/components/Hero.jsx#L114-L115) | La primera impresión de un portafolio *creativo* es medio lienzo negro. Ningún referente premiado deja la mitad del hero sin función. |
| H2 | **No hay foto, retrato ni ningún elemento visual en el hero** — pese a que `me.png` existe en `public/`. | Captura `hero.png`; G11 | Cero conexión humana en el punto de mayor atención. |
| H3 | **No hay indicador de scroll.** El hero mide `min-h-screen` y nada sugiere que haya 7933 px de página debajo. | `metrics.json` → `docHeight: 7933`; captura `hero.png` | Riesgo de que el visitante no baje. |
| H4 | **El glitch se dispara cada 4.5 s indefinidamente, aunque el hero esté fuera de pantalla.** El `setInterval` no se pausa nunca ni se condiciona a visibilidad. | [Hero.jsx:92](src/components/Hero.jsx#L92); animación en [index.css:409-453](src/index.css#L409-L453) | Trabajo de composición y batería quemados de forma permanente en un elemento que no se está viendo. Sin salida para `prefers-reduced-motion`. |
| H5 | **`will-change: transform, opacity, filter` se inyecta inline en cada letra y nunca se retira.** Medido en runtime: 12 elementos con `will-change` distinto de `auto` de forma permanente. | [Hero.jsx:44](src/components/Hero.jsx#L44); [index.css:379](src/index.css#L379); `metrics.json` → `willChangeCount: 12` | `will-change` permanente es un antipatrón conocido: fuerza capas de composición que nunca se liberan. Debe ponerse justo antes de animar y quitarse al terminar. |
| H6 | **Toda la entrada del hero anima `filter: blur()`.** Letras `blur(4px)`, subtítulo y bio `blur(8px)`. | [Hero.jsx:57,67,78](src/components/Hero.jsx#L54-L83) | `filter` no es una propiedad de composición pura: cada frame obliga a re-rasterizar. Sobre texto grande es de lo más caro que se puede animar. Ver §5. |
| H7 | **La firma en Allura a `lg:text-[8rem]` tiene trazos muy finos sobre negro.** | Captura `hero.png`; [Hero.jsx:118](src/components/Hero.jsx#L118) | Legibilidad justa a tamaño grande y peor aún en pantallas de bajo contraste. **[no verificado]**: no he medido el contraste percibido de un trazo caligráfico fino (las fórmulas WCAG asumen texto sólido); lo señalo como riesgo de diseño, no como incumplimiento. |

### 3.3 Skills

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| S1 | **`fontFamily: 'monospace'` aplicado en línea rompe el sistema tipográfico.** Las familias realmente en uso son 4: Space Grotesk, Allura, Syne y `monospace` genérica del sistema. Ni `monospace` ni Allura están declaradas en `tailwind.config.js` (solo `display` y `body`). | [Skills.jsx:243,259](src/components/Skills.jsx#L243); `metrics.json` → `fontFamilies`; [tailwind.config.js](tailwind.config.js) | Visualmente la sección parece pegada de otro sitio: es la única en tipografía de terminal dentro de un diseño editorial. Además `monospace` genérica renderiza distinto en cada SO, así que el aspecto no es estable. |
| S2 | **La timeline alterna lados y deja huecos verticales enormes.** Con `gap-16 sm:gap-20` más el ancho de columna `sm:w-[calc(50%-2rem)]`, cada nodo deja la mitad opuesta vacía. | Captura `sec-skills.png`: entre el nodo `.NET` y el nodo `React` hay ~230 px de vacío; la sección mide 2120 px de alto para 8 items | La sección más larga del sitio (2120 px, el 27 % de la página) es la de menor densidad informativa. |
| S3 | **`blur(20px)` animado en la descripción de cada nodo.** Es el blur más agresivo del sitio, ×8 nodos. | [Skills.jsx:144](src/components/Skills.jsx#L144) | Ver §5. El coste de rasterizado escala con el radio del blur. |
| S4 | **`select-none` impide copiar el nombre y la descripción de cada tecnología.** | [Skills.jsx:242,258](src/components/Skills.jsx#L242) | Hostil sin beneficio: bloquea a quien quiera copiar tu stack, y no protege nada. |
| S5 | **La sección `#skills` no aparece en la navegación.** El menú tiene solo Home / Projects / Contact. | [Navbar.jsx:11-15](src/components/Navbar.jsx#L11-L15) vs `<section id="skills">` en [Skills.jsx:170](src/components/Skills.jsx#L170) | 2120 px de contenido sin acceso directo. |
| S6 | **Los encabezados de sección quedan bajo la navbar fija al llegar por scroll.** Visible en las capturas: "Skills" y "Tell me about your idea." aparecen cortados por arriba. | Capturas `sec-skills.png`, `sec-contact.png` | La navegación interna compensa con `offset: -80` ([Navbar.jsx:49](src/components/Navbar.jsx#L49)), pero el scroll normal, los enlaces profundos y el recargar con hash no. Falta un `scroll-margin-top` en las secciones. |

### 3.4 Proyectos

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| P1 | **El fondo repinta la página completa en cada frame de scroll.** Tres `ScrollTrigger` con `scrub: 1` por proyecto escriben `--bg-from`/`--bg-to` en `document.body`, que alimenta un `linear-gradient` a pantalla completa. | [Projects.jsx:51-117](src/components/Projects.jsx#L51-L117); [index.css:43](src/index.css#L43) | Un gradiente de viewport completo no se puede componer en GPU: es repintado íntegro por frame. Es la causa más probable del descenso de fluidez medido (§5). |
| P2 | **`transition: background 0.3s ease` en el `body` pelea contra el `scrub`.** El scrub escribe valores nuevos ~60 veces por segundo y cada escritura reinicia una transición CSS de 300 ms sobre la misma propiedad. | [index.css:47](src/index.css#L47) + [Projects.jsx:59-66](src/components/Projects.jsx#L59-L66) | Dos sistemas de animación compitiendo por la misma propiedad. Produce retardo perceptible respecto al scroll y trabajo duplicado. |
| P3 | **`scrollIntoView({behavior:'smooth'})` nativo mientras Lenis controla el scroll.** El resto del sitio usa `lenisRef.current.scrollTo()` correctamente; este punto no. | [Projects.jsx:230](src/components/Projects.jsx#L230) vs [Navbar.jsx:49](src/components/Navbar.jsx#L49) y [Hero.jsx:145,158](src/components/Hero.jsx#L145) | Dos motores de scroll disputándose el control tras abrir un caso de estudio, justo en el momento de mayor carga de animación. |
| P4 | **Vacíos enormes entre proyectos.** `gap-56 lg:gap-72` (224 px / 288 px) más `py-16` en cada sección. | [Projects.jsx:289,294](src/components/Projects.jsx#L289); capturas `scroll-05.png` y `scroll-075.png` (por debajo de Mea Culpa hay ~350 px sin contenido) | Existen para dar recorrido a la transición cromática, pero se leen como página rota. Se puede conservar el recorrido de scroll sin dejar el viewport en blanco. |
| P5 | **En móvil, el logo y la hamburguesa desaparecen sobre las capturas claras.** La navbar con scroll usa `.glass` = `rgba(255,255,255,0.04)`; sobre una imagen casi blanca, el logo blanco y las barras blancas se pierden. | Captura `mobile-projects.png` (el logo "Paulo Jimenez" es ilegible); [index.css:127-132](src/index.css#L127-L132); [Navbar.jsx:59-62](src/components/Navbar.jsx#L59-L62) | Navegación inaccesible en pantallas concretas. Es un fallo funcional, no estético. |
| P6 | **9 animaciones con `filter: blur()` solo en `ProjectCard`, multiplicadas por 4 tarjetas.** | [ProjectCard.jsx:82,101,122,144](src/components/ProjectCard.jsx#L82) | Ver §5. |
| P7 | **El número de proyecto a `opacity-10` es prácticamente invisible.** | [ProjectCard.jsx:230](src/components/ProjectCard.jsx#L230); capturas `scroll-05.png`, `scroll-075.png` | Elemento decorativo que no llega a leerse; ocupa espacio sin aportar jerarquía. |
| P8 | **El lightbox no atrapa el foco ni tiene rol de diálogo.** Se cierra con Escape ([Projects.jsx:30-39](src/components/Projects.jsx#L30-L39)), pero no hay `role="dialog"`, `aria-modal`, focus trap ni devolución del foco al cerrar. | [Projects.jsx:357-381](src/components/Projects.jsx#L357-L381) | Con el lightbox abierto, el teclado sigue tabulando por la página de detrás. |
| P9 | **El truco de alternancia usa `direction: rtl` y lo revierte en cada hijo.** | [ProjectCard.jsx:180,184,227](src/components/ProjectCard.jsx#L180) | Funciona, pero `direction` es una propiedad semántica de dirección de texto usada como herramienta de layout. Frágil ante cualquier hijo nuevo que olvide el `lg:[direction:ltr]`. `order` o `grid-column` hacen lo mismo sin efectos colaterales. |

### 3.5 Contacto y pie

| # | Problema | Evidencia | Impacto |
|---|---|---|---|
| C1 | **El campo de email es `type="text"`.** Confirmado en runtime: `emailInputType: "text"`. | [Contact.jsx:219-221](src/components/Contact.jsx#L219); `a11y.json` | En móvil no aparece el teclado de email (sin `@` accesible). Fricción justo en el formulario que convierte. |
| C2 | **`autoComplete="off"` en los tres campos.** Confirmado: `["contact-name:off","contact-email:off","contact-message:off"]`. | [Contact.jsx:187,206,228,251](src/components/Contact.jsx#L206); `a11y.json` | Bloquea el autorrelleno del navegador en nombre y email. Debería ser `name` y `email`. |
| C3 | **Los mensajes de estado del formulario no se anuncian.** 0 elementos con `aria-live` en toda la página. Un lector de pantalla no percibe "Enviando…", "Enviado" ni el error. | [Contact.jsx:270-274](src/components/Contact.jsx#L270); `a11y.json` → `ariaLive: 0` | El usuario ciego no sabe si el envío funcionó. |
| C4 | **Los errores por campo no se enlazan con el input.** Falta `aria-invalid` y `aria-describedby`; el error se comunica por color de borde y texto rojo suelto. | [Contact.jsx:145-148,203-204](src/components/Contact.jsx#L145) | Estado transmitido solo por color (WCAG 1.4.1). |
| C5 | **El copyright del pie tiene contraste 2.35:1 — incumple WCAG AA.** `rgba(245,245,240,0.3)` a 12 px sobre `#0A0A0B`. Mínimo exigido: 4.5:1. | [Footer.jsx:103](src/components/Footer.jsx#L103); contraste calculado en runtime | Único incumplimiento **medido** de contraste. El resto de textos muestreados pasa: bio del hero 12:1, enlaces de nav 19.2:1, descripción de Skills 4.91:1, etiquetas del formulario 6.82:1, email del pie 9.17:1. |
| C6 | **`<p>` vacío en el pie.** | [Footer.jsx:46-47](src/components/Footer.jsx#L46-L47) | Marcado muerto; probablemente un tagline que se quedó sin escribir. |
| C7 | **La hamburguesa no declara `aria-expanded`.** 0 elementos con `aria-expanded` en la página. | [Navbar.jsx:98-102](src/components/Navbar.jsx#L98); `a11y.json` | El lector de pantalla no informa si el menú está abierto o cerrado. |
| C8 | **`.whatsapp-pulse` anima `box-shadow` en bucle infinito, sin condición ni pausa.** | [index.css:86-100](src/index.css#L86-L100) | `box-shadow` provoca repintado; en bucle permanente sobre un elemento `fixed` es consumo constante. Con un pseudo-elemento y `transform: scale` + `opacity` el mismo efecto es puramente de composición. |

---

## 4. Recomendaciones priorizadas

Tecnologías propuestas, todas compatibles con el stack detectado: **React 18.3.1, Vite 6.4.2, Tailwind 3.4.19, GSAP 3.15.0 (con plugins premium ya incluidos), Lenis 1.3.23**. Ninguna recomendación exige instalar una dependencia nueva salvo donde se indique explícitamente.

Los esfuerzos son estimaciones de trabajo enfocado, no plazos.

### Prioridad ALTA

**A1 · Añadir soporte de `prefers-reduced-motion` en toda la aplicación**
*Qué cambiar:* una alternativa reducida global. `gsap.matchMedia()` con un contexto `"(prefers-reduced-motion: reduce)"` que sustituya cada reveal por un fade corto o por el estado final; `lenis.destroy()` (o no instanciarlo) en ese modo; detener el `setInterval` del glitch; y un bloque `@media (prefers-reduced-motion: reduce)` en `index.css` para `whatsapp-pulse` y las transiciones largas.
*Tecnología:* `gsap.matchMedia()` (GSAP core, ya instalado) + media query CSS.
*Esfuerzo:* 3-5 h. *Aborda:* G2, H4, C8. *Referencia:* [wodniack.dev](https://wodniack.dev/) (SOTD + Developer Award, 12 dic 2024) incorpora incluso un control explícito de *"Change contrast"* en la interfaz — la accesibilidad como parte visible del oficio, no como parche.

**A2 · Dejar de animar `filter: blur()` como propiedad principal de entrada**
*Qué cambiar:* sustituir los ~25 usos de `blur()` en los reveals por combinaciones de `opacity` + `y`/`scale`. Si quieres conservar la sensación de enfoque, aplícala solo al hero y como *máscara* (`clip-path` o `mask-image` animando el gradiente), que sí es compositable.
*Tecnología:* GSAP core; `clip-path` (el sitio ya lo usa bien en [ProjectCard.jsx:25-38](src/components/ProjectCard.jsx#L25-L38)).
*Esfuerzo:* 3-4 h. *Aborda:* H6, S3, P6.

**A3 · Sacar el gradiente animado del `body`**
*Qué cambiar:* mover el gradiente a una capa `position: fixed; inset: 0; z-index: -1` y hacer *cross-fade* de `opacity` entre dos capas de color en lugar de reescribir el gradiente. Eliminar `transition: background` del `body` ([index.css:47](src/index.css#L47)), que duplica trabajo contra el `scrub`.
*Tecnología:* GSAP ScrollTrigger (ya en uso) sobre `opacity` — compositable.
*Esfuerzo:* 2-3 h. *Aborda:* P1, P2.

**A4 · Reparar accesibilidad de teclado y formulario**
*Qué cambiar:* (a) un estilo `:focus-visible` global para enlaces y botones; (b) `type="email"` y `autoComplete="name" | "email"` en el formulario; (c) `aria-live="polite"` en el mensaje de estado; (d) `aria-invalid` + `aria-describedby` en los campos con error; (e) `aria-expanded` en la hamburguesa; (f) `role="dialog"` + `aria-modal` + focus trap en el lightbox; (g) subir el copyright del pie a `light/60` como mínimo.
*Tecnología:* CSS y atributos HTML. Sin librerías.
*Esfuerzo:* 3-4 h. *Aborda:* G3, C1, C2, C3, C4, C5, C7, P8.

**A5 · Meta de compartición + SEO básico**
*Qué cambiar:* `og:title`, `og:description`, `og:image` (1200×630), `og:url`, `twitter:card=summary_large_image`, `canonical`, más `robots.txt` y `sitemap.xml`. Actualizar `document.documentElement.lang` al alternar idioma y alinear el valor inicial de `index.html` con el idioma por defecto real.
*Tecnología:* HTML estático en `index.html` + dos archivos en `public/`.
*Esfuerzo:* 1-2 h. *Aborda:* G4, G5, G6. Es la mejor relación impacto/esfuerzo del informe.

**A6 · Peso de imágenes y cabeceras de caché**
*Qué cambiar:* convertir las 14 capturas a AVIF/WebP con respaldo, añadir `width`/`height` a cada `<img>`, quitar `loading="lazy"` de la primera imagen visible del primer proyecto, y crear `vercel.json` con `Cache-Control: public, max-age=31536000, immutable` para `/assets/*` y una caché larga para `/projects/*`.
*Tecnología:* Vite (`vite-imagetools` **[requiere instalar dependencia]**) o conversión previa con `sharp`/`squoosh` y commit de los archivos — la segunda opción no añade dependencias al build.
*Esfuerzo:* 2-4 h. *Aborda:* G7, G8, G9.

### Prioridad MEDIA

**M1 · Sustituir los dos splitters de texto manuales por SplitText**
*Qué cambiar:* reemplazar el `innerHTML` a mano de [Hero.jsx:33-50](src/components/Hero.jsx#L33-L50) y el `.split('')` de [Skills.jsx:245-253](src/components/Skills.jsx#L245-L253) por `SplitText` con `type: "lines,words,chars"` y `mask: "lines"`, que da el reveal por líneas enmascaradas característico del trabajo premiado. Aprovechar para retirar el `will-change` permanente (H5) usando `autoRound` y limpieza en `onComplete`.
*Tecnología:* `gsap/SplitText` — **ya presente en `node_modules`, no requiere instalación**.
*Esfuerzo:* 3-4 h. *Aborda:* G1, H5. *Referencia:* [Elliott Mangham](https://elliott.mangham.dev) (SOTD, 2 dic 2025, 7.24) declara exactamente **GSAP + JavaScript + Vite**, página única, categoría *Microinteractions* — misma familia de stack que este proyecto, sin WebGL. Es la prueba de que no hace falta Three.js para llegar a SOTD.

**M2 · Rediseñar el hero para eliminar el vacío derecho**
*Qué cambiar:* dar función a la mitad derecha. Opciones: retrato tratado (ya tienes `me.png`), una pieza tipográfica a gran escala, un canvas ligero, o un bloque de "disponibilidad / ubicación / stack" en tipografía pequeña. Añadir indicador de scroll animado.
*Tecnología:* Tailwind + GSAP core.
*Esfuerzo:* 4-8 h según opción. *Aborda:* H1, H2, H3. *Referencia:* [Pacôme Pertant](https://pacomepertant.com/) (SOTD, 9 jun 2026, 7.76) — tecnologías declaradas: **GSAP, Three.js, Nuxt.js**; categorías *Scrolling, Transitions, 3D, Microinteractions*.

**M3 · Unificar la tipografía de Skills y comprimir su layout**
*Qué cambiar:* eliminar los `fontFamily: 'monospace'` inline. Si el registro técnico te interesa como recurso, declara una fuente mono real en `tailwind.config.js` (p. ej. la que ya se descarga, o una sola adicional) en lugar de la genérica del sistema. Reducir los huecos verticales o cambiar la timeline por una rejilla más densa. Quitar `select-none`. Añadir "Skills" a la navegación.
*Tecnología:* Tailwind config + CSS.
*Esfuerzo:* 3-5 h. *Aborda:* S1, S2, S4, S5.

**M4 · Arreglar la legibilidad de la navbar sobre fondos claros**
*Qué cambiar:* aumentar la opacidad del fondo `.glass` cuando hay scroll, o añadir un gradiente de protección de arriba hacia abajo detrás de la navbar, o invertir el color del logo según la luminancia de la paleta del proyecto activo (ya tienes `project.palette` por sección).
*Tecnología:* CSS + el estado de paleta ya existente en [Projects.jsx](src/components/Projects.jsx).
*Esfuerzo:* 2-3 h. *Aborda:* P5.

**M5 · Unificar el scroll programático bajo Lenis**
*Qué cambiar:* reemplazar el `scrollIntoView` de [Projects.jsx:230](src/components/Projects.jsx#L230) por `lenisRef.current.scrollTo()`. Requiere pasar `lenisRef` a `Projects` (hoy solo lo reciben `Navbar` y `Hero`) o exponerlo por contexto. Añadir `scroll-margin-top` a las secciones para el problema de anclas bajo la navbar.
*Tecnología:* Lenis (ya instalado) + CSS `scroll-margin-top`.
*Esfuerzo:* 1-2 h. *Aborda:* P3, S6.

**M6 · Transiciones de apertura del caso de estudio con Flip**
*Qué cambiar:* la expansión actual mide `scrollHeight` a mano, anima `height` y llama a `ScrollTrigger.refresh()` ([Projects.jsx:181-233](src/components/Projects.jsx#L181-L233)). `Flip` hace exactamente esta transición de layout — incluyendo el reflujo de las tarjetas vecinas — con `Flip.getState()` / `Flip.from()`, y animando solo transforms.
*Tecnología:* `gsap/Flip` — **ya presente en `node_modules`**.
*Esfuerzo:* 4-6 h. *Aborda:* la animación de mayor coste del sitio; también reduce el `height` animado (que provoca layout) a transforms. *Referencia:* [Gianluca Gradogna](https://gianlucagradogna.com/) (SOTD 23 ene 2025, 7.4; Dev Award 7.44) — categorías *Transitions, Typography, Infinite Scroll*; usa preloader con contador numérico ("Loading portfolio") como pieza de transición.

### Prioridad BAJA

**B1 · Limpiar peso muerto**
Quitar `Great Vibes` del `@import`, mover las fuentes a `<link rel="preconnect">` + `<link rel="stylesheet">` en `index.html`, eliminar `me.png` si no vas a usarlo (o usarlo, ver M2), borrar el `<p>` vacío del pie y corregir la fuga del ticker en `App.jsx`.
*Esfuerzo:* 1 h. *Aborda:* G10, G11, G12, C6.

**B2 · Reducir los vacíos entre proyectos sin perder la transición cromática**
Bajar `gap-56 lg:gap-72` y compensar el recorrido de scroll con `end` más largos en los ScrollTrigger, o convertir el espacio muerto en un separador con contenido (el número del proyecto siguiente, una cita, el índice).
*Esfuerzo:* 2-3 h. *Aborda:* P4, P7.

**B3 · Dividir el bundle**
365 KB en un solo chunk (128 KB con brotli). Los dos showcases (320 líneas cada uno) solo se necesitan al pulsar "case study": son candidatos naturales a `React.lazy`. `react-icons` se importa desde tres subpaquetes distintos (`si`, `fi`, `fa`).
*Tecnología:* `React.lazy` + `Suspense`; `build.rollupOptions.manualChunks` en Vite.
*Esfuerzo:* 2-3 h.

**B4 · Sustituir el truco de `direction: rtl` por `order`/`grid-column`**
*Esfuerzo:* 1 h. *Aborda:* P9.

**B5 · Explorar animaciones CSS scroll-driven para los efectos simples**
Los reveals de una sola pasada (líneas que crecen, fades de entrada) pueden moverse a `animation-timeline: view()`, que corre fuera del hilo principal y no necesita JS. Reservar GSAP para lo orquestado. **[no verificado]**: no he comprobado el soporte en los navegadores concretos de tu audiencia — decide según tus analíticas si necesitas alternativa.
*Tecnología:* CSS scroll-driven animations (nativo, sin dependencias).
*Esfuerzo:* 3-4 h.

### Referencias de inspiración verificadas

Consultadas en agosto de 2026 en las fichas oficiales de Awwwards (premio, fecha, puntuación y tecnologías tal como las declara cada ficha):

| Sitio | Premio y fecha | Puntuación | Tecnologías declaradas | Qué destaca |
|---|---|---|---|---|
| [Pacôme Pertant](https://pacomepertant.com/) | Site of the Day, 9 jun 2026 | 7.76 | GSAP, Three.js, Nuxt.js | Narrativa visual con ritmo; categorías *Scrolling, Transitions, 3D, Microinteractions* |
| [Elliott Mangham](https://elliott.mangham.dev) | Site of the Day, 2 dic 2025 | 7.24 | **GSAP, JavaScript, Vite** | Página única con GSAP y Vite, sin WebGL. Preloader con contador de progreso y navegación por teclado explícita ("RETURN KEY [ENTER]") verificados en el HTML |
| [Antoine Wodniack — AW Portfolio](https://wodniack.dev/) | Site of the Day + Developer Award, 12 dic 2024 | 7.56 / 7.58 | Portfolio, Scrolling, Single page, Typography, Minimal | Control de accesibilidad *"Change contrast"* expuesto en la propia interfaz (verificado en el HTML) |
| [Gianluca Gradogna](https://gianlucagradogna.com/) | Site of the Day, 23 ene 2025 | 7.4 (Dev Award 7.44) | Horizontal Layout, Infinite Scroll, Typography, Transitions | Preloader con contador numérico ("Loading portfolio") como pieza de diseño |
| [Adcker](https://adcker.com/) | Site of the Day, 1 may 2026 | 7.32 | **WordPress, GSAP, BARBA.js** | Demuestra que la transición entre páginas, no el 3D, puede ser el diferenciador |
| [Dennis Snellenberg](https://www.awwwards.com/sites/dennis-snellenberg) | Site of the Day + Developer Award | — | — | 2× SOTD, 2× Developer Award, 9× Honorable Mention como desarrollador independiente |

**Lectura conjunta:** de los seis, solo uno declara Three.js. Tres son de una sola página. Los diferenciadores recurrentes son **transiciones, tipografía, microinteracciones y preloader**, no gráficos 3D. Tu stack actual ya alcanza para competir en ese terreno.

---

## 5. Riesgos

### 5.1 Rendimiento

**Medición realizada.** Chrome headless sobre el dev server, scroll programado de 40 pasos por toda la página:
- **~40 FPS** de media durante el recorrido
- **0 tareas largas** (`longtask`) registradas

> **Caveat honesto:** la medición se hizo en headless con `--disable-gpu`, así que el valor absoluto de FPS **no es representativo de un navegador real con aceleración**. Lo que sí es informativo es la combinación: cero tareas largas significa que el JavaScript **no** es el cuello de botella. El coste está en pintura y composición — exactamente lo que predicen los hallazgos P1, P2, H6, S3 y P6. Antes de dar por buena cualquier optimización, mide en Chrome real con el panel Performance y con throttling de CPU 4×.

**Concentración del riesgo.** Solo tres causas explican la mayor parte del coste:

1. **Gradiente de viewport completo reescrito por frame** ([Projects.jsx:51-117](src/components/Projects.jsx#L51-L117) + [index.css:43](src/index.css#L43)). Un gradiente sobre `body` no se puede promover a capa de composición: cada valor nuevo es un repintado de pantalla completa. Agravado por la transición CSS que compite ([index.css:47](src/index.css#L47)).
2. **~25 animaciones de `filter: blur()`** repartidas por Hero, Skills, ProjectCard, Contact y los dos showcases. `filter` fuerza re-rasterización; el coste crece con el radio, y `blur(20px)` en [Skills.jsx:144](src/components/Skills.jsx#L144) es el peor caso.
3. **`will-change` permanente** en 12 elementos ([Hero.jsx:44](src/components/Hero.jsx#L44), [index.css:379](src/index.css#L379)). Capas de composición que se crean y nunca se liberan, consumiendo memoria de GPU indefinidamente.

**Regla a aplicar:** animar solo `transform` y `opacity`. `clip-path` y `mask` son aceptables como alternativa al blur. Todo lo demás — `height`, `filter`, `box-shadow`, `background` — solo con justificación explícita y medición.

**Core Web Vitals — riesgos identificados:**
- **LCP:** el elemento LCP más probable es el `<h1>` del hero o la primera imagen de proyecto. Las 14 imágenes son PNG sin optimizar (4.8 MB en total, una de 1.75 MB) y todas `loading="lazy"` (G8, G9). Además la cabecera de caché desactiva el almacenamiento incluso de los assets con hash (G7). El `@import` de fuentes dentro del CSS (G10) serializa la cadena CSS → import → fuente antes de que se pinte el texto.
- **CLS:** ninguna de las 14 imágenes declara `width`/`height` (G9). La animación de `height` al abrir un caso de estudio ([Projects.jsx:201-209](src/components/Projects.jsx#L201-L209)) desplaza todo el contenido posterior; si esa interacción entra en la ventana de medición, cuenta como cambio de layout.
- **INP:** abrir un caso de estudio encadena dos `requestAnimationFrame`, una medición de `scrollHeight` (fuerza reflow síncrono), un timeline y un `ScrollTrigger.refresh()` ([Projects.jsx:181-233](src/components/Projects.jsx#L181-L233)). Es la interacción con mayor riesgo del sitio.

### 5.2 Accesibilidad

**Estado actual: no hay soporte de `prefers-reduced-motion` en ningún punto del código.** Verificado por búsqueda en el repositorio y confirmado en runtime (0 media queries de reduced-motion entre las hojas de estilo cargadas).

Concretamente, un usuario con `reduce` activado recibe hoy: el glitch del hero cada 4.5 segundos indefinidamente (H4), scroll suavizado de Lenis que anula el control nativo, ~25 transiciones con desenfoque, cambios de color de fondo a pantalla completa durante todo el recorrido de proyectos, y el pulso infinito del botón de WhatsApp (C8). No hay forma de desactivar nada.

Es el hallazgo más serio del informe en términos de impacto sobre personas reales, y también el que más pesa en una evaluación tipo Awwwards, donde la accesibilidad forma parte de la puntuación de desarrollo.

**Resto de riesgos de accesibilidad, por orden:**

| Riesgo | Estado medido |
|---|---|
| Foco de teclado invisible | 4 de 31 elementos focusables sin indicador; única regla de foco en todo el CSS: `.form-input:focus` (G3) |
| Estado del formulario no anunciado | 0 elementos `aria-live` (C3) |
| Errores de formulario solo por color | Sin `aria-invalid` ni `aria-describedby` (C4) |
| Idioma declarado incorrecto | `lang="es"` con interfaz por defecto en inglés, sin actualizar al alternar (G4) |
| Contraste insuficiente | 1 incumplimiento medido: copyright del pie 2.35:1 frente al mínimo 4.5:1 (C5) |
| Menú móvil sin estado | 0 elementos `aria-expanded` (C7) |
| Lightbox sin semántica de diálogo | Sin `role="dialog"`, sin focus trap, sin devolución de foco (P8) |
| Navegación ilegible sobre fondos claros | Logo y hamburguesa blancos sobre capturas casi blancas en móvil (P5) |
| Texto no seleccionable | `select-none` sobre nombres y descripciones de tecnologías (S4) |
| Sin enlace de salto al contenido | Ninguno detectado |

**Nota sobre el orden de trabajo:** A1 (reduced-motion) y A4 (teclado y formulario) resuelven juntas la mayoría de esta tabla y no dependen de ninguna decisión de diseño. Se pueden ejecutar antes de que respondas nada de la sección 6.

---

## 6. Preguntas antes de implementar

No asumo ninguna respuesta. Necesito estas decisiones antes de tocar código:

**Alcance y prioridad**

1. ¿Quieres que ejecute las recomendaciones ALTA completas antes de tocar nada visual, o prefieres empezar por el rediseño del hero (M2) porque el impacto visible te importa más ahora?
2. ¿Hay una fecha o un evento asociado a esto (postular a un empleo, presentar a Awwwards, enviar a clientes)? Cambia radicalmente el orden: postular prioriza A5 + A6 + M2; presentar a Awwwards prioriza A1 + A4 + M1 + M6.
3. ¿Apruebas que estos cambios se hagan en una rama aparte con commits por bloque, o los quieres directamente en `main`?

**Dirección visual**

4. El hero tiene 40-45 % del ancho vacío (H1). ¿Qué prefieres ahí: (a) tu foto tratada — ya existe `me.png` sin usar, (b) una pieza tipográfica a gran escala, (c) un canvas ligero de partículas o ruido, (d) un bloque de información (disponibilidad, ubicación, stack), o (e) otra idea tuya?
5. ¿La firma manuscrita (Allura) es identidad de marca intocable, o está abierta a revisión? Condiciona toda la jerarquía tipográfica.
6. El `monospace` de Skills (S1) rompe el sistema. ¿Lo elimino en favor de Space Grotesk, o el registro "técnico" es intencional y prefieres que declare una fuente mono real y la use de forma consistente en más sitios?
7. La transición cromática por proyecto es la idea más fuerte del sitio, pero cuesta rendimiento (P1). ¿La conservamos optimizándola (A3, mismo efecto visual), o estás abierto a reemplazarla por algo más barato?
8. ¿Existe una guía de marca, paleta o referencia visual que deba respetar, más allá de lo que está en el código?

**Contenido**

9. No hay sección "Sobre mí": la única biografía son 4 líneas en el hero, y no hay ninguna foto tuya en el sitio. ¿Quieres que el rediseño contemple una sección propia, o prefieres mantener el formato compacto?
10. Solo 2 de los 4 proyectos tienen caso de estudio (`SHOWCASE_IDS = [1, 4]` en [Projects.jsx:12](src/components/Projects.jsx#L12)). ¿Planeas escribir los de Bougainvillea y MantenTools? Afecta a si vale la pena invertir en M6.
11. Para las metaetiquetas `og:` (A5) necesito: ¿qué imagen quieres para la tarjeta de compartición (1200×630), y qué texto debe aparecer en español y en inglés?
12. ¿Cuál es el idioma por defecto correcto? El HTML dice español y la aplicación arranca en inglés (G4). ¿Cuál gana?

**Restricciones técnicas**

13. ¿Puedo instalar dependencias en fases posteriores? Concretamente `vite-imagetools` para A6. Si no, convierto las imágenes fuera del build y las commiteo (funciona igual, sin añadir nada al proyecto).
14. ¿Tienes analíticas del sitio? Saber el reparto móvil/desktop y los navegadores reales decide si B5 (animaciones CSS scroll-driven) es viable y cuánto pesa optimizar móvil.
15. ¿Quieres que Lenis se desactive por completo con `prefers-reduced-motion`, o prefieres reducir su duración manteniendo algo de suavizado?
16. ¿Tienes acceso a la configuración del proyecto en Vercel para añadir `vercel.json` (A6), y hay algún despliegue automático que deba tener en cuenta?
17. ¿Quieres que el glitch del hero (H4) sobreviva en alguna forma, o lo retiro? Hoy se dispara cada 4.5 segundos de forma indefinida y es el efecto con peor relación coste/beneficio del sitio.

---

## Anexo — Inventario del stack detectado

| Paquete | En `package.json` | Instalado |
|---|---|---|
| react / react-dom | ^18.3.1 | 18.3.1 |
| gsap | ^3.12.5 | **3.15.0** |
| lenis | ^1.1.18 | 1.3.23 |
| tailwindcss | ^3.4.17 | 3.4.19 |
| vite | ^6.0.5 | 6.4.2 |
| react-icons | ^5.4.0 | — |
| express / cors / dotenv / nodemailer | backend local (`server.js`) | — |

**Plugins de GSAP disponibles sin instalar nada** (verificados como archivos completos en `node_modules/gsap/`): SplitText, Flip, ScrollSmoother, ScrollToPlugin, DrawSVGPlugin, MorphSVGPlugin, MotionPathPlugin, Observer, CustomEase, CustomBounce, CustomWiggle, InertiaPlugin, Physics2DPlugin, ScrambleTextPlugin, TextPlugin, EasePack, Draggable, GSDevTools.

**Actualmente en uso:** solo `gsap` core y `ScrollTrigger`.

| Métrica | Valor medido |
|---|---|
| Altura total de la página | 7933 px |
| Secciones | hero (900 px), skills (2120 px), projects (3845 px), contact (724 px) |
| Bundle JS | 365 003 B sin comprimir → 127 867 B con brotli, un único chunk |
| Bundle CSS | 30 319 B → 6 379 B comprimido |
| Imágenes | 14 PNG, 4.8 MB; mayor: 1.75 MB |
| Elementos focusables | 31 (4 sin indicador de foco visible) |
| Familias tipográficas en uso | 4 (Space Grotesk, Syne, Allura, monospace genérica) |
| Fuentes descargadas | 4 familias (una, Great Vibes, nunca usada) |
| Errores de consola | 0 |
| Reglas `prefers-reduced-motion` | 0 |
| Elementos con `will-change` permanente | 12 |
