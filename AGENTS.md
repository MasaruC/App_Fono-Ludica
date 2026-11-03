# 🗣️ Contexto Maestro y Reglas del Proyecto: "Bosque Sonoro" (IHC)
> **Directiva de Contexto Permanente para Agentes de IA y Asistentes de Desarrollo**  
> **Repositorio:** `d:\.Antigravity\IHC` | **Asignatura:** Interacción Humano-Computador (IHC) — UNMSM  
> **Documento Canónico SSOT:** `Proyecto/Documentación/Recursos Compartidos/Contexto Maestro del Proyecto - Aplicación Fono-Lúdica Bosque Sonoro.md`

---

## 🚨 1. DESLINDE CLÍNICO MANDATORIO (PROHIBICIÓN ESTRICTA)

> ### 🛑 REGLA INVIOLABLE: CERO CONFUSIÓN DE DOMINIO SENSORIAL
> **LA APLICACIÓN NO ES, NUNCA HA SIDO Y NO DEBE SER CATALOGADA BAJO NINGUNA CIRCUNSTANCIA COMO UNA APP PARA DISCAPACIDAD AUDITIVA, HIPOACUSIA, SORDERA O USUARIOS CON IMPLANTE COCLEAR.**
>
> - **Población Objetivo:** Niños y niñas en edad preescolar (**3 a 5 años**) en Lima Metropolitana con **AUDICIÓN NORMAL / FUNCIONAL**, que presentan **dificultades de articulación fonética, retraso fonético-fonológico y dislalias funcionales** (foco prioritario en fonemas críticos del español peruano: `/r/`, `/rr/`, `/s/`, `/l/`, `/ch/`, sílabas complejas y trabadas).
> - **Naturaleza del Trastorno:** La barrera es **neuromotriz orofacial, articulatoria y práxica** (dificultades en el punto y modo de articulación, fuerza labio-lingual) y de **organización fonológica** (persistencia de Procesos de Simplificación Fonológica - PSF: omisión, sustitución y distorsión según TEPROSIF-R y escala Bosch-Melgar).
> - **Por qué la audición es indispensable:** El sistema se fundamenta en el **entrenamiento auditivo-verbal, discriminación fónica, retroalimentación acústica contingente (<300 ms) y modelado fonoaudiológico por voz**. Si el niño tuviera hipoacusia severa o sordera, los ejercicios fono-articulatorios basados en reconocimiento de voz y discriminación fonémica no tendrían validez funcional ni metodológica.

---

## 👥 2. Modelo de Usuarios y Principios de Interacción (IHC / CCI)

El sistema opera bajo un **Modelo Asimétrico Dual** diseñado para la interacción niño-computadora (*Child-Computer Interaction - CCI*):

### A. Usuario Infantil (3 a 5 años — Preescolar)
- **Condición Cognitiva:** Pre-lector estricto (etapa preoperacional piagetiana). **NO sabe leer.**
- **Principio Fundamental:** **Voice-First y 100% No-Textual**.
  - **PROHIBIDO:** Colocar párrafos, instrucciones escritas, subtítulos extensos o etiquetas técnicas ("fonema", "articulación") en las pantallas del niño.
  - **OBLIGATORIO:** Toda consigna debe ser guiada por la voz y animación de la mascota **Ava** (una abeja), apoyada en iconografía colosal y metáforas tangibles (el tren fonético, la carrera soplada, el espejo mágico).
- **Ergonomía Motriz:**
  - Blancos táctiles colosales (*touch targets* $\ge 48\times 48\text{ dp}$, recomendados $64\text{ a }76\text{ px}$).
  - Separación amplia entre elementos interactivos ($\ge 16\text{ px}$) para evitar toques accidentales por motricidad fina en desarrollo.
  - Zona de resguardo palmar (*palm rejection*) en los bordes.
  - Orientación fija horizontal (**Landscape 16:9**), optimizada para tabletas de 10 a 12 pulgadas.
- **Filosofía de Gamificación (No Punitiva):**
  - **Cero castigo:** Prohibidos timbres de error desagradables (*buzzers* estridentes), cruces rojas o pérdida de "vidas".
  - **Refuerzo positivo por aproximación:** Reconocer el esfuerzo articulatorio del menor.
  - **Mecanismo de rescate:** Al 3.er intento infructuoso, Ava interviene modelando la praxia bucofacial 2D y adaptando dinámicamente la dificultad (DDA).

### B. Usuario Adulto Mediador (Docente de Inicial, Fonoaudiólogo / SLP, Padre de Familia)
- **Compuerta Cognitiva (MathGate):** El acceso a configuraciones, reportes o salida del juego está protegido por un desafío aritmético/cognitivo para evitar que el niño abandone la experiencia guiada.
- **Dashboard Clínico-Pedagógico:** Visualización de telemetría objetiva:
  - Registro de Procesos de Simplificación Fonológica (PSF: Omisión, Sustitución, Distorsión).
  - Trazabilidad alineada a herramientas estandarizadas (**TEPROSIF-R** y **Prueba de Articulación de Fonemas de Melgar / Bosch**).
  - Tasas de acierto fonético, latencias de respuesta fónica y curvas de evolución pre/post sesión.

---

## 🧭 3. Estructura y Navegación del Repositorio

| Directorio / Archivo | Propósito y Contenido Principal |
| :--- | :--- |
| `AGENTS.md` / `agent.md` | **Este archivo.** Directrices maestras, deslinde clínico y reglas de negocio para agentes. |
| `README.md` | Visión general del proyecto, mapa navegable y guía de despliegue del prototipo. |
| `Proyecto/Proyecto.md` | Planificación académica, competencias curriculares (CT6.3, CT8.2, RA2-RA4) y cronograma. |
| `Proyecto/Documentación/Recursos Compartidos/` | **Núcleo SSOT:** Contexto Maestro del Proyecto, Design System Pediátrico, SRS, Casos de Uso, Catálogo del Prototipo y capturas. |
| `Proyecto/Documentación/Actividad 6 - Metaforas/` | Fundamentación teórica y operacionalización de los 4 tipos de metáforas IHC. |
| `Proyecto/Documentación/Actividad 7 - Principios.../` | Las 3 Reglas de Theo Mandel, directrices ISO/WCAG 2.2 AA y evolución de interfaces v1➔v2➔v3. |
| `Proyecto/Documentación/Actividad 10 - Prueba.../` | Plan y reporte de Usabilidad y Accesibilidad (Micro-SCED, Nielsen, PSSUQ, MARS, SUS, Emojis). |
| `Proyecto/Antecedentes/` | 10 antecedentes indexados del estado del arte con sus fichas RAE completas. |
| `Proyecto/Prototipo_Refactorización/` | **Código fuente principal en desarrollo:** Vite 6 + Capacitor 6 (Android APK), ES6, Web Audio API, Canvas 2D de praxias, telemetría y consola remota (`evaluador.html`). |
| `Proyecto/Prototipo/` | Prototipo web original HTML5/CSS/JS (conservado como base histórica). |

---

## 📚 4. Fundamentación Científica Canónica (Los 10 Antecedentes)

Cuando redactes análisis, justificaciones o código para este proyecto, cita e intégrate con las 10 investigaciones del repositorio:

1. **Huertas & Roque (2023):** Diagnóstico de dificultades fonético-fonológicas en preescolares de Lima Metropolitana.
2. **Condori & Larico (2022):** Juegos verbales y expresión oral en niños de educación inicial.
3. **Pucuhuaranga (2016):** Efectividad de canciones y rimas en la articulación verbal infantil.
4. **Mora et al. (2024):** Eficacia de programas lúdico-fonológicos para la dislalia funcional.
5. **Peña et al. (2024 - Nature Scientific Reports):** Intervención con tabletas y aplicaciones interactivas en habilidades comunicativas tempranas.
6. **Saeedi et al. (2024 - Nature Scientific Reports):** Serious Game *Ava* para trastornos de los sonidos del habla (SSD) en pediatría.
7. **Du et al. (2023):** Criterios de diseño UX/UI en aplicaciones para fonoaudiología pediátrica.
8. **Furlong et al. (2018):** Análisis de calidad y efectividad de aplicaciones móviles para la intervención del habla infantil.
9. **Strömbergsson et al. (2026):** Entrenamiento del habla asistido por voz con la app *Pop2* y concordancia de evaluadores.
10. **Liu, Chen & Razak (2026 - MDPI):** Criterios de calidad e interacción niño-computadora (CCI) en entornos preescolares.

---

## 🛠️ 5. Pila Tecnológica y Arquitectura de Software

- **Frontend & Runtime:** HTML5 semántico, CSS3 modular (tokens de diseño accesibles), JavaScript moderno ES6+, Vite 6.
- **Empaquetado Móvil:** Capacitor 6 para generación del build nativo Android (`apk`).
- **Subsistema de Audio y Fonoaudiología:** Web Audio API para análisis de tono, volumen y Voice Activity Detection (VAD) de baja latencia (<300 ms).
- **Modelado Visual Sagital:** Canvas 2D optimizado para simulación interactiva de praxias bucofaciales (movimiento labio-lingual coordinado con la pronunciación).
- **Telemetría y Evaluación:** Doble canal cliente-evaluador (`remote-evaluator-app.js` + `telemetry-eval-engine.js`), exportación estructurada JSON para cálculo de métricas pre/post.

---

## 📋 6. Reglas de Conducta para el Asistente en Respuestas y Tareas

1. **Jamás asumir ni sugerir problemas auditivos:** Si el usuario pide diseñar una pantalla, evaluar accesibilidad o escribir código, el foco es **motricidad fonoarticulatoria y desarrollo fonológico**, NO lengua de señas ni adaptaciones para sordera.
2. **Preservar la identidad de Ava y la estética preescolar:** Paleta armónica basada en la naturaleza del bosque, sin sobrecarga visual, contrastes aptos para visión en desarrollo y modo de alto contraste para Deficiencia Visual Cortical (CVI).
3. **Mantener la fidelidad con los entregables existentes:** Enlazar siempre a los documentos correspondientes en `Proyecto/Documentación/` usando sintaxis markdown navegable (`file:///` o enlaces relativos directos).
4. **No alterar innecesariamente comentarios técnicos ni docstrings:** Mantener la integridad de los contratos y componentes en `Proyecto/Prototipo_Refactorización/js/`.
5. **Autonomía guiada:** Si una tarea requiere decisiones de diseño o fonoaudiología, priorizar las fuentes científicas ya sistematizadas en `Proyecto/Antecedentes/` y en el `Contexto Maestro`.

---

## 🧰 7. Skills Especializadas del Workspace (`.agents/skills/`)

Para asegurar la fundamentación rigurosa de cada propuesta y la coherencia en el diseño infantil, el repositorio cuenta con las siguientes skills disponibles en `.agents/skills/`:

1. **`fundamentacion-toma-decisiones`** ([SKILL.md](file:///d:/.Antigravity/IHC/.agents/skills/fundamentacion-toma-decisiones/SKILL.md)):
   - **Propósito:** Aplica la jerarquía obligatoria de evidencia científica (Prioridad 1: Los 10 antecedentes locales y el Contexto Maestro; Prioridad 2: Entregables técnicos locales de Actividades 6, 7 y 10; Prioridad 3: Literatura externa revisada por pares).
   - **Formato:** Exige documentar cambios y propuestas mediante la **Matriz Canónica de Decisiones** (ID/Nombre, Problema, Fundamentación con cita, Implementación empírica e Indicador/Métrica objetiva).

2. **`diseno-ihc-metaforas-pediatricas`** ([SKILL.md](file:///d:/.Antigravity/IHC/.agents/skills/diseno-ihc-metaforas-pediatricas/SKILL.md)):
   - **Propósito:** Operacionaliza las 4 metáforas de interfaz (Visual, Funcional, Organizacional y de Interacción) para erradicar el texto en usuarios pre-lectores de 3 a 5 años (Voice-First).
   - **Ergonomía Pediátrica:** Regula los blancos táctiles (*touch targets* mínimos $\ge 48\text{ dp}$, recomendados $64\text{ a }76\text{ px}$, pulsador de fonación $80\text{ a }100\text{ px}$), separación inter-elemento $\ge 16\text{ px}$, margen palmar $24\text{ a }32\text{ px}$, gamificación no punitiva con DDA y compuerta de seguridad cognitiva (**MathGate**).


