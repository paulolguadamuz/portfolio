# Mea Culpa — Plataforma Web y Gestión de Partidas de Rol (TTRPG)

##  Descripción del Proyecto
**Mea Culpa** es una aplicación web full-stack y plataforma interactiva para la gestión integral de partidas y personajes en juegos de rol de mesa (estilo D&D / Fantasía Medieval). Está construida sobre una arquitectura moderna e inmersiva que combina un frontend dinámico en **Next.js (App Router y TypeScript)** con una base de datos robusta y segura en **Supabase (PostgreSQL y Row Level Security)**.

La plataforma permite a los directores de juego (DMs) y jugadores administrar el ciclo de vida completo de una campaña: desde la progresión del personaje y su economía, hasta salas de juego en tiempo real, comercio de objetos, gremios y mecánicas personalizadas de dados.

---

## ⚡ Secciones y Características Principales

1. **Gestión Integral de Personajes y Perfiles:**
   - Creación, progresión hasta nivel 20 y vinculación con fichas externas (Nivel20).
   - **Sistema de Inventario y Equipamiento:** Gestión inteligente de bolsas (capacidad por fuerza del personaje), equipamiento con ranuras dinámicas (armas a dos manos, capas, anillos, gemas) y seguimiento del estado de las extremidades y signos vitales.
   - **Ciclo de Vida:** Mecánicas de descanso, estados de vida o muerte (`sleep or die`) y resurrección.

2. **Compendio y Registro de Conjuros:**
   - Base de datos interactiva con más de cientos de hechizos catalogados por escuela, nivel y clase (`spells/conjuros.json`).
   - Buscador avanzado y sistema de aprendizaje/validación de conjuros conocidos y ranuras de conjuro disponibles por personaje.

3. **Economía Transaccional, Tiendas y Comercio:**
   - Sistema de oro protegido con auditoría completa y transacciones seguras (`RLS`).
   - Tiendas públicas con catálogos dinámicos y un mercado de intercambio de objetos en tiempo real entre jugadores.
   - **Gremios:** Creación de clanes con baúles compartidos y sistema de cobro de impuestos administrativos por parte del reino/GM.

4. **Partidas, Salas de DM y Módulo de Dados:**
   - Salas interactivas de juego (`sala-dm`, `sala-player`, `sala-feed`) que sincronizan eventos y tiradas.
   - **Módulo Visual de Dados:** Configurador de dados, tiradas en tiempo real y tablas de botín/recompensas automáticas (`dice-visual`).

5. **Monetización e Integración de Pagos (PayPal):**
   - Pasarela de pagos para el desbloqueo de ranuras adicionales de personaje y servicios especiales (resurrecciones, ruleta de premios con auditoría e historial).

---

##  Mi Rol y Contribuciones en el Proyecto

Durante mi trabajo en el desarrollo y mantenimiento de **Mea Culpa**, me enfoqué en las siguientes áreas clave:

- **Desarrollo de la Sección de Perfiles de Personaje:** Implementación y mejora de la interfaz gráfica y la lógica de negocio para la ficha de personaje, inventario interactivo, control de extremidades (`limbs`), equipamiento de objetos y visualización de estados vitales.
- **Módulo y Listado de Conjuros:** Construcción del compendio mágico interactivo (`SpellSearchModal` y `spells-registry`), implementando filtros avanzados por escuela y nivel, además del sistema de validación y asignación de hechizos en el perfil del jugador.
- **Arreglo de Bugs y Optimización:** Identificación, diagnóstico y corrección de errores (*bugfixing*) en flujos críticos del frontend y backend, mejorando la estabilidad transaccional, la respuesta de la interfaz y la sincronización con Supabase.
- **Asistencia y Soporte a Clientes Principales:** Trato directo y asistencia técnica integral para los usuarios principales y directores de juego (GMs), resolución de incidencias en partidas, atención de reportes de *feedback* (`feedback-widget`) y soporte en vivo durante eventos clave.

---

##  Stack Tecnológico
- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS / Vanilla CSS modular.
- **Backend & Base de Datos:** Supabase (PostgreSQL, Row Level Security, RPC/Funciones SQL), Next.js API Routes.
- **Integraciones:** PayPal SDK / Webhooks, Nivel20 API, Módulo de tiradas procedurales.
