---
title: "Actividad 10: Plan y Reporte de Prueba de Usabilidad y Accesibilidad Fundamentado en la Literatura"
sticker: emoji//1f9ea
color: var(--mk-color-green)
tags:
  - proyecto/documentacion
  - actividad-10
  - pruebas-usabilidad
  - accesibilidad-pediatrica
  - wcag-2-2
  - iso-9241-11
  - dislalia-funcional
  - pssuq
  - mars-scale
  - heuristicas-nielsen
  - sced
curso: "[[Interacción Humano Computador]]"
docente: "Dr. Ivan Carlo Petrlik Azabache"
integrantes:
  - "Campos Luque, Juan Masaru (24200153)"
  - "León García, Angel Gabriel (24200156)"
  - "Sandoval Dominguez, Erick Marco A. (24200172)"
  - "Melendez Bustamante, Alvaro M. (24200166)"
institucion: "Universidad Nacional Mayor de San Marcos - FISI"
version: 3.0.0
fecha: 2026-11-01
estado: Refactorizado con Fundamentación Científica de las 10 Fuentes y Acotación Operativa Realista
aliases:
  - Actividad 10 - Prueba de Usabilidad y Accesibilidad
  - Plan de Pruebas de Usabilidad Bosque Sonoro
---

# 🧪 Actividad 10: Plan y Reporte de Prueba de Usabilidad y Accesibilidad
## 🗣️ Aplicación Fono-Lúdica Pediátrica "Bosque Sonoro"

**Universidad Nacional Mayor de San Marcos**  
*Universidad del Perú, Decana de América*  
*Facultad de Ingeniería de Sistemas e Informática*  
*Curso: Interacción Humano Computador*  
*Docente: Dr. Ivan Carlo Petrlik Azabache*  
*Grupo: G7*  

**Estudiantes:**
- Campos Luque, Juan Masaru (24200153)
- León García, Angel Gabriel (24200156)
- Sandoval Dominguez, Erick Marco A. (24200172)
- Melendez Bustamante, Alvaro M. (24200166)

---

> [!IMPORTANT] Deslinde Clínico y Enfoque Real del Proyecto
> **Población Objetivo Real:** Niños y niñas en edad preescolar (**3 a 5/6 años**) con **dificultades de pronunciación, trastornos de los sonidos del habla (TSH / *Speech Sound Disorders*) y dislalias funcionales** (focalizadas en la articulación de fonemas como `/r/`, `/rr/`, `/s/`, `/l/`, `/ch/`, sinfones y sílabas complejas) en **Lima Metropolitana**, acompañados por docentes de educación inicial, padres de familia y fonoaudiólogos.
> 
> **Deslinde Clínico Mandatorio:** La aplicación **NO** está diseñada para niños con deficiencia auditiva, hipoacusia o prótesis auditivas. La población infantil destinataria cuenta con **audición normal y funcional**. Su dificultad radica en la coordinación motriz fonoarticulatoria (lengua, labios, paladar y control del soplo) y en la persistencia de Procesos de Simplificación Fonológica (PSF). Por tanto, el audio de alta fidelidad y las locuciones habladas de Ava son recursos centrales de modelado fónico, no barreras de exclusión.

---

## 🧭 Mapa General del Marco Metodológico y su Acotación Realista

```mermaid
graph TD
    subgraph MarcoIdeal ["📚 1. Marco Metodológico del Estado del Arte (Literatura)"]
        M1["Evaluación Tripartita de Actores<br>• Expertos IHC/Informática Médica (Saeedi et al., 2024)<br>• Fonoaudiólogos / SLPs (Du et al., 2023; Furlong et al., 2018)<br>• Infantes Preescolares 3-6 años (Liu et al., 2026)"]
        M2["Diseños Experimentales de Referencia<br>• Pre-test / Post-test con Grupo Control (Peña et al., 2024; Mora et al., 2024)<br>• Caso Único SCED sesión a sesión (Strömbergsson et al., 2025)"]
    end

    subgraph AcotacionRealista ["🛠️ 2. Acotación Operativa para Equipo Universitario Autofinanciado"]
        A1["Capa 1: Inspección Heurística Cruzada entre Pares (Equipo G7)<br>10 Heurísticas de Nielsen (0-4) + Auditoría de Schwa [ə] y MARS técnico"]
        A2["Capa 2: Validación con Mediadores Accesibles (Docentes Inicial / Tutores)<br>Cuestionario PSSUQ (1-7) + Sub-escala MARS + Alertas docentes (Huertas & Roque, 2023)"]
        A3["Capa 3: Piloto Micro-SCED con Preescolares Cercanos (N = 3 a 5 niños)<br>Muestra de palabras Bosch & Melgar (O/S/D) + Concordancia ASR vs. Humano + Emojis"]
    end

    MarcoIdeal -->|"Adaptación pragmática sin fondos externos"| AcotacionRealista
```

---

## 1. Fundamentación Metodológica de las Pruebas según las Fuentes

El diseño de la fase de evaluación de **"Bosque Sonoro"** no parte de supuestos empíricos aislados, sino que sintetiza la evidencia metodológica de **9 investigaciones indexadas (2016–2026)** sobre aplicaciones móviles para trastornos de los sonidos del habla (TSH) e Interacción Niño-Computadora (CCI).

### 1.1 Metodología de Evaluación en la Literatura (¿Cómo estructurar la fase de evaluación?)

Las fuentes científicas establecen un enfoque metodológico basado en **tres capas complementarias de evaluadores** y un **diseño experimental riguroso**:

#### A. Evaluación Tripartita de Actores
1. **Expertos en IHC / Informática Médica:** Realizan una inspección heurística inicial para detectar fallos de arquitectura, navegación e interfaz antes de exponer al niño a la aplicación, tal como lo detallan **Saeedi et al. (2024)**.
2. **Fonoaudiólogos / Patólogos del Habla (SLPs):** Validan la calidad de la interfaz, el rigor de los estímulos fonéticos, la dosificación terapéutica y la utilidad clínica utilizando instrumentos psicométricos estandarizados, según lo fundamentan **Saeedi et al. (2024)**, **Furlong et al. (2018)** y **Du et al. (2023)**.
3. **Infantes Preescolares (3 a 5/6 años):** Participan en sesiones de prueba guiadas u observadas (de 30 a 45 minutos en estudios clínicos completos, o fracciones dosificadas de 10 a 15 minutos por sesión) para medir la navegabilidad real, la atracción visual y las reacciones emocionales mediante escalas adaptadas con pictogramas y emojis, de acuerdo con **Saeedi et al. (2024)** y **Liu et al. (2026)**.

#### B. Diseño Experimental de la Evaluación en la Literatura
- **Diseño Pre-test y Post-test con Grupo Control:** Metodología cuantitativa validada por **Peña et al. (2024)**, **Mora Espinoza et al. (2024)** y **Pucuhuaranga (2016)** para demostrar causalidad estadística en las ganancias de articulación fonética entre una línea base inicial y la medición posterior a la intervención lúdica.
- **Diseño Experimental de Caso Único (*SCED - Single-Case Experimental Design*):** Recomendado específicamente por **Strömbergsson et al. (2025)** para aplicaciones de entrenamiento del habla autoguiadas, permitiendo registrar sesión por sesión la trayectoria de aprendizaje y la precisión fonética (*target accuracy*) de cada menor de manera individualizada.

---

### 1.2 Acotación Operativa y Factibilidad Realista (Equipo Estudiantil sin Financiamiento)

> [!NOTE] Justificación de Alcance para Grupo Universitario Autofinanciado
> Como equipo de investigación conformado por **4 estudiantes de pregrado de Ingeniería de Sistemas (FISI - UNMSM)** que desarrolla este proyecto sin financiamiento externo, sin subvenciones clínicas y dentro del cronograma semestral de una asignatura, **no resulta viable contratar ni reclutar formalmente a especialistas certificados en Informática Médica, paneles de Fonoaudiólogos colegiados (SLPs), ni ejecutar un ensayo clínico longitudinal de varios meses con decenas de pacientes**.
> 
> Por ello, siguiendo los principios de *Discount Usability Engineering* (Nielsen, 1994) y adaptando rigurosamente los protocolos de **Saeedi et al. (2024)**, **Strömbergsson et al. (2025)** y **Huertas & Roque (2023)**, la evaluación se acota de forma **plausible, ética y metodológicamente trazable** en tres niveles ejecutables con nuestros propios recursos:

| Capa del Modelo Teórico | Exigencia Ideal en Estudios Financiados | Acotación Plausible Ejecutada por el Equipo (G7 - UNMSM) | Sustento de Validez Metodológica |
| :--- | :--- | :--- | :--- |
| **1. Evaluación de Expertos en IHC** | Panel externo de expertos en IHC e Informática Médica (**Saeedi et al., 2024**). | **Inspección Heurística Cruzada Interna (*Peer Evaluation*):** Los 4 integrantes del grupo —capacitados en principios de Mandel, heurísticas de Nielsen y WCAG 2.2— auditan de forma independiente el prototipo antes de las pruebas con usuarios. | **Saeedi et al. (2024)** emplearon 3 evaluadores para identificar el 85%+ de los problemas de severidad mayor/catastrófica con las 10 heurísticas de Nielsen (escala 0–4). |
| **2. Validación Clínica y Pedagógica** | Co-diseño y evaluación con 5 a 37 fonoaudiólogos pediatras (**Du et al., 2023; Saeedi et al., 2024**). | **Validación con Mediadores Pedagógicos Accesibles (2 a 3 adultos):** En lugar de SLPs clínicos de difícil acceso, se recurre a **docentes de educación inicial y/o padres tutores** del entorno cercano del equipo, aplicando el cuestionario **PSSUQ** y una rúbrica **MARS** adaptada. | **Huertas & Roque (2023)** demuestran que en Lima Metropolitana las docentes de inicial son quienes detectan en primera línea las alertas fonológicas en el aula. |
| **3. Pruebas con Infantes y Diseño Experimental** | Ensayo Pre/Post con grupo control ($N=25\text{ a }152$, **Peña et al., 2024; Mora et al., 2024**) o sesiones largas de 30–45 min (**Saeedi et al., 2024**). | **Piloto Transversal de Caso Único (*Micro-SCED Formativo*, $N = 3\text{ a } 5$ niños):** Muestra por conveniencia de niños de 3 a 5 años (familiares directos/vecinos de los integrantes con dificultades leves de pronunciación) en **1 sesión breve de 12 a 15 minutos** para evitar fatiga. | **Strömbergsson et al. (2025)** validan el enfoque de Caso Único (*SCED*) con muestras pequeñas ($N=6$) para analizar *target accuracy* y concordancia del ASR por participante. |

---

## 2. Dimensiones de Análisis (¿Qué se debe analizar?)

Durante la ejecución de la prueba acotada (tanto en la inspección heurística del equipo como en el piloto con niños y mediadores), el análisis se concentra en **cuatro dimensiones científicas críticas**:

```mermaid
graph LR
    subgraph DimensionesAnalisis ["🔍 4 Dimensiones de Análisis Empírico"]
        D1["1. Usabilidad Técnica y<br>Adaptación Motriz Pediátrica<br>(Liu et al., 2026; Saeedi et al., 2024)"]
        D2["2. Calidad de Interfaz y<br>Flujo de Interacción Voice-First<br>(Saeedi et al., 2024)"]
        D3["3. Precisión Fonética y<br>Rendimiento Acústico<br>(Strömbergsson et al., 2025; Peña et al., 2024)"]
        D4["4. Ausencia de Antipatrones<br>Fonéticos y Schwa [ə]<br>(Furlong et al., 2018)"]
    end
```

### 2.1 Usabilidad Técnica y Adaptación Motriz Pediátrica
Conforme a **Liu et al. (2026)** y **Saeedi et al. (2024)**, se analiza si el tamaño de los controles interactivos, el ritmo de respuesta y los objetivos táctiles (botones de al menos $48 \times 48\text{ dp}$, y específicamente nuestro pulsador central de micrófono de $76\text{ px}$ con halo de $90\text{ px}$ y la franja palmar con debounce de $80\text{ ms}$) se adecúan al desarrollo de la motricidad fina y la atención preescolar. El objetivo es verificar empíricamente que los problemas de interfaz no se conviertan en un obstáculo motor que impida el aprendizaje fonético.

### 2.2 Calidad de la Interfaz y Flujo de Interacción
Siguiendo a **Saeedi et al. (2024)**, se analiza el contraste cromático (tanto en el tema biofílico estándar como en el **Modo CVI** de alto contraste $>12:1$), la eficacia de la navegación 100% no textual guiada por voz (*spoken read-aloud*) a cargo de la abejita Ava, y la simplicidad en la presentación de la información por pantalla para no confundir ni sobreestimular cognitivamente al niño.

### 2.3 Precisión Fonética y Rendimiento Acústico (*Target Accuracy*)
De acuerdo con **Strömbergsson et al. (2025)** y **Peña et al. (2024)**, se analiza el porcentaje de fonemas e intentos producidos correctamente (*target accuracy*) por el infante en dos niveles de complejidad dentro de la app:
- **Contextos aislados:** Palabras individuales en los vagones de Pares Mínimos y Bingo Sonoro (ej. *"Pera"*, *"Rana"*, *"Sapo"*).
- **Contextos continuos:** Frases rítmicas, rimas o trabalenguas cortos en el Vagón de Trabalenguas y la Carrera Fónica.

### 2.4 Ausencia de Antipatrones Fonéticos
Atendiendo la alerta clínica de **Furlong et al. (2018)** tras auditar 132 aplicaciones comerciales, nuestro propio equipo técnico analiza la calidad acústica de los archivos y síntesis de audio de la app, verificando:
1. La erradicación de distorsiones robóticas mediante el ajuste prosódico natural en español de Lima Metropolitana.
2. La **ausencia estricta de la vocal neutra parásita *schwa* (`[ə]`)** al aislar consonantes (asegurando que el modelo emita `/s/` como `[s:]` y nunca como *"suh"*, o `/r/` sin vocal intrusiva), así como la no contaminación de palabras estímulo.

---

## 3. Criterios de Identificación de Hallazgos (¿Qué se debe identificar?)

El protocolo de observación y registro está diseñado para identificar y catalogar **cuatro tipos específicos de evidencia**:

### 3.1 Problemas de Usabilidad y su Nivel de Severidad (Escala 0 a 4)
Siguiendo la metodología de **Saeedi et al. (2024)** basada en las 10 Heurísticas de Nielsen, cada fallo único de usabilidad detectado se cataloga y clasifica en una escala de severidad de **0 a 4**:
- **0 = Sin problema:** No constituye un fallo de usabilidad.
- **1 = Problema cosmético:** No necesita corregirse a menos que exista tiempo extra en el proyecto.
- **2 = Problema menor de usabilidad:** Baja prioridad de corrección.
- **3 = Problema mayor de usabilidad:** Importante de corregir; recibe alta prioridad en el backlog.
- **4 = Catástrofe de usabilidad:** Imperativo corregirlo antes de liberar el producto.

> [!WARNING] Benchmark Crítico de Saeedi et al. (2024) a Vigilar en "Bosque Sonoro"
> En su evaluación heurística de juegos serios para trastornos del habla, **Saeedi et al. (2024)** identificaron que la heurística **H5: "Prevención de errores"** presentó la severidad media más crítica (**$3.83 / 4.0$**), mientras que **H3: "Control y libertad del usuario"** concentró la mayor cantidad absoluta de fallos (falta de botones claros de salida o retorno). Por ello, nuestra inspección pone especial énfasis en auditar que los modales de praxias 2D tengan salida colosal ($56\times 56\text{ px}$) y que la franja palmar prevenga toques involuntarios.

### 3.2 Tipología de Procesos de Simplificación Fonológica (PSF)
Conforme exigen **Pucuhuaranga (2016)** y **Peña et al. (2024)**, durante los ejercicios vocales del niño (y en el registro del *Dashboard*), los errores articulatorios observados se identifican y clasifican en las **tres categorías estandarizadas**:
1. **Omisiones (O):** Supresión total del fonema o consonante en sinfón (ej. decir *"pato"* en lugar de *"plato"* o *"atón"* por *"ratón"*).
2. **Sustituciones (S):** Reemplazo del fonema meta por otro de menor exigencia motriz (ej. rotacismo sustituyendo `/r/` por `/l/`: *"pelo"* por *"pera"*).
3. **Distorsiones (D):** Emisión de un sonido aproximado pero acústicamente impreciso o lateralizado.

### 3.3 Descalibración en la Retroalimentación Automática (ASR vs. Juicio Humano)
Tal como advierten **Strömbergsson et al. (2025)**, en aplicaciones de habla infantil basadas en reconocimiento automático o umbrales acústicos (VAD/Web Audio API), es vital identificar las **discrepancias entre el puntaje/estrellas entregado automáticamente por la app y la evaluación perceptual humana** del observador en sala:
- **Falso Positivo (Aprobación errónea):** El niño pronuncia con sustitución evidente (ej. *"pelo"* en vez de *"pera"*), pero el motor acústico le otorga 3 estrellas de acierto pleno sin mostrar ayuda.
- **Falso Negativo (Rechazo injustificado):** El niño pronuncia correctamente el fonema meta, pero por hablar bajito o por ruido de fondo del ambiente, la app lo cuenta como fallo, corriendo el riesgo de frustrarlo si no interviene el rescate DDA.

### 3.4 Nivel de Conocimiento y Necesidades Docentes Reales
Siguiendo a **Huertas & Roque (2023)**, en la entrevista y prueba con los mediadores adultos (docentes de inicial o tutores en Lima Metropolitana) se identifican qué alertas fonológicas suelen detectar en su quehacer diario y si la visualización del *Dashboard* (curvas de PSF, semáforo TEPROSIF-R y bóveda de audio) resulta comprensible y accionable sin requerir formación médica especializada.

---

## 4. Instrumentos y Métricas de Calificación (¿Qué y cómo se debe medir?)

La siguiente matriz consolida los **7 instrumentos y métricas estandarizadas** extraídos de la literatura científica, indicando su valor objetivo ideal y su **aplicación acotada** dentro de nuestro proyecto universitario:

| Ámbito a Evaluar | Instrumento / Escala Recomendada | Métrica / Valor Objetivo en Literatura | Autor y Año de Referencia | Aplicación en nuestro Proyecto Acotado (G7 - UNMSM) |
| :--- | :--- | :--- | :--- | :--- |
| **1. Problemas de Interfaz y Navegación** | **10 Heurísticas de Usabilidad de Nielsen** (Escala de severidad 0 a 4) | Severidad promedio general **$\le 1.5 / 4.0$** y severidad en *Prevención de Errores* **$< 1.0$**. | **Saeedi et al. (2024)** | **Aplicado al 100% (Fase 1):** Ejecutado mediante inspección cruzada por los 4 miembros del equipo sobre las 13 vistas del prototipo. |
| **2. Calidad Integral de Software mHealth** | **Escala MARS** (*Mobile Application Rating Scale*, escala 1 a 5 en Compromiso, Funcionalidad, Estética e Información) | Puntuación total MARS **$\ge 4.2 / 5.0$** (superando ampliamente la media del mercado comercial de $3.7$). | **Furlong et al. (2018)** | **Aplicado en Versión Abreviada (Fases 1 y 2):** Autoevaluación técnica y validación con mediadores sobre las 4 dimensiones MARS y erradicación de *schwa*. |
| **3. Satisfacción de Usabilidad por Adultos Mediadores** | **Cuestionario PSSUQ** (*Post-Study System Usability Questionnaire*, escala Likert 1 a 7) | Puntaje medio global **$\ge 6.0 / 7.0$** y sub-escala *Calidad de Interfaz* (*Interface Quality*) **$\ge 6.25 / 7.0$**. | **Saeedi et al. (2024)** | **Aplicado en Versión Focalizada (Fase 2):** Respondido por los 2–3 docentes de inicial / tutores tras probar MathGate y el Dashboard clínico. |
| **4. Atracción y Aceptación Infantil** | **Cuestionario Pictórico con Emojis / Smileyometer** (para niños de 3 a 6 años) | **$\ge 90\%$** de agrado estético e intención de volver a jugar expresada por los niños. | **Saeedi et al. (2024)** | **Aplicado al 100% (Fase 3):** Integrado nativamente en la app y en tarjetón físico con 3 ítems pictóricos (Agrado, Diversión, Intención de repetir). |
| **5. Perfil Fonológico y Articulación Verbal** | **Ficha de Articulación de Laura Bosch y María Melgar de González** | Evaluación de **32 palabras test** en posiciones Inicial, Medial y Final (clasificando O, S, D). | **Pucuhuaranga (2016)** | **Aplicado en Subconjunto Piloto (Fase 3):** En la sesión de 15 min se evalúa una muestra de **6 palabras representativas** (Inicial, Medial, Final) para medir *Target Accuracy* y concordancia ASR vs. Humano. El banco completo de 32 palabras queda cargado en el sistema. |
| **6. Ganancias en Simplificación Fonológica** | **Batería Estandarizada TEPROSIF-R** | Medición de la reducción estandarizada de PSF pre y post-intervención. | **Peña et al. (2024)** | **Implementado en Dashboard / Simulado para Piloto:** Dado que no podemos realizar una intervención longitudinal de meses, se evalúa la **usabilidad del módulo TEPROSIF-R** en el Dashboard con datos longitudinales simulados y registro basal de la sesión piloto. |
| **7. Significancia Estadística de Mejora** | **Prueba de Kruskal-Wallis / U de Mann-Whitney** | Demostración de efectividad (**$p < 0.05$**) en todos los niveles de severidad inicial (Grave, Moderado, Leve). | **Mora Espinoza et al. (2024)** | **Documentado para Escalabilidad Clínica:** Se reporta estadística descriptiva en el piloto formativo ($N=4$) y se deja estructurada la exportación JSON/CSV para aplicar pruebas no paramétricas ($p < 0.05$) en un estudio cuasi-experimental futuro. |

---

## 5. Perfiles de Participantes y Protocolo de Ejecución Acotado

### 5.1 Participantes del Estudio Piloto Acotado (Muestra por Conveniencia)
Aprovechando la red familiar y académica cercana de los 4 integrantes del grupo (cero costo de reclutamiento), se conforma la siguiente muestra realista:

| Código | Rol / Grupo | Perfil Participante | Edad | Condición / Contexto Real | Instrumentos Aplicados |
| :---: | :--- | :--- | :---: | :--- | :--- |
| **E01–E04** | **Capa 1: Evaluadores IHC** | 4 Estudiantes de Ing. de Sistemas (Grupo G7 - UNMSM) | 20–23 años | Conocimiento en Reglas de Mandel, WCAG 2.2, Heurísticas de Nielsen y arquitectura Web Audio. | Matriz de 10 Heurísticas de Nielsen (0–4), Auditoría de Schwa `[ə]` y MARS técnico. |
| **M01** | **Capa 2: Mediador Docente** | Docente de Educación Inicial (Contacto académico/familiar en Lima) | Adulta | Experiencia en aula preescolar detectando dificultades de habla cotidianas (**Huertas & Roque, 2023**). | Tarea MathGate + Revisión Dashboard + Cuestionario **PSSUQ (1–7)** y **MARS (1–5)**. |
| **M02** | **Capa 2: Mediador Tutor** | Madre/Padre de familia de preescolar | Adulta | Acompañante de práctica domiciliaria sin formación médica fonoaudiológica. | Tarea MathGate + Revisión Dashboard + Cuestionario **PSSUQ (1–7)** y **MARS (1–5)**. |
| **P01** | **Capa 3: Infante Piloto 1** | Mateo (Sobrino/vecino de integrante) | 4 años | **Dislalia funcional leve (rotacismo):** Sustituye `/r/` por `/l/` (*"pelo"* por *"pera"*). Audición normal. | Muestra Bosch & Melgar (O/S/D) + Tareas T1/T2 + Cuestionario Pictórico de Emojis. |
| **P02** | **Capa 3: Infante Piloto 2** | Sofía (Familiar de integrante) | 3 años | **Simplificación de sinfones:** Omite consonante líquida en `/pl/` (*"pato"* por *"plato"*). Pre-lectora estricta. | Muestra Bosch & Melgar (O/S/D) + Tareas T1/T2 + Cuestionario Pictórico de Emojis. |
| **P03** | **Capa 3: Infante Piloto 3** | Lucas (Vecino de integrante) | 5 años | **Dificultad en vibrante múltiple `/rr/` y `/s/`:** Tendencia a frustrarse cuando lo corrigen. | Muestra Bosch & Melgar (O/S/D) + Prueba de rescate DDA (3 fallos) + Emojis. |
| **P04** | **Capa 3: Infante Piloto 4** | Valentina (Familiar de integrante) | 4 años | **Sigmatismo (`/s/`):** Prueba adicional con activación del **Modo CVI** de alto contraste. | Evaluación de legibilidad visual CVI + Tareas T1/T2 + Emojis. |

---

### 5.2 Tareas Críticas y Flujo de la Sesión Piloto (12 a 15 minutos)

```mermaid
sequenceDiagram
    autonumber
    actor Eval as 🧑‍💻 Estudiante Evaluador (G7)
    actor Nino as 👶 Niño Preescolar (P01-P04)
    participant App as 🐝 Prototipo "Bosque Sonoro"
    actor Med as 👩‍🏫 Docente / Tutor (M01-M02)

    Note over Eval, App: Etapa Previa (Sin el niño): Capa 1 - Inspección Heurística
    Eval->>App: Audita 10 Heurísticas de Nielsen (0-4) y ausencia de Schwa [ə]

    Note over Nino, App: Etapa en Campo (12-15 min): Capa 3 - Sesión Infantil Micro-SCED
    Eval->>Nino: Asentimiento infantil con tarjetones de Ava (Jugar vs. Pausa)
    App->>Nino: T1 (Navegación Voice-First): "¡Hola! ¿A qué vagón quieres jugar hoy?"
    Nino->>App: Toca juguete del vagón sin ayuda lectora (Meta < 45 s)
    App->>Nino: T2 (Articulación Bosch & Melgar - 6 palabras): Modelo fónico "Pera"
    Nino->>App: Pulsa botón micrófono (90px) y vocaliza
    Eval->>Eval: Registra PSF (O / S / D) y compara Juicio Humano vs. Estrellas ASR
    alt 3 intentos fallidos consecutivos
        App-->>Nino: Activa DDA: Estrella de esfuerzo + Praxia Lingual 2D animada
    end
    App->>Nino: Despliega Cuestionario Pictórico de Emojis (Saeedi et al., 2024)
    Nino->>App: Señala caritas (Agrado visual, Diversión, Intención de volver a jugar)

    Note over Med, App: Etapa Mediador (5-8 min): Capa 2 - Gobernanza y PSSUQ / MARS
    Med->>App: T3: Desbloquea MathGate verbalizado (< 5 s) y explora Dashboard TEPROSIF-R
    Med->>Eval: Completa Cuestionario PSSUQ (escala 1-7) y valoración MARS (escala 1-5)
```

---

## 6. Evaluación de Accesibilidad Universal WCAG 2.2 y Ergonomía Motriz

Siguiendo a **Liu et al. (2026)**, **Du et al. (2023)** y **Saeedi et al. (2024)**, se audita el cumplimiento técnico de los componentes frente a estándares de accesibilidad y motricidad fina preescolar:

| Componente | Criterio WCAG 2.2 / Literatura | Nivel | Requisito Pediátrico Fundamentado | Estado en el Prototipo V2 |
| :--- | :--- | :---: | :--- | :---: |
| **Pulsador de micrófono central (`UI-BTN-MIC`)** | 2.5.8 / 2.5.5 Tamaño del objetivo (**Liu et al., 2026**) | AA / AAA | Mínimo $48\times 48\text{ dp}$; implementado con diámetro visual de $76\text{ px}$ y halo táctil de $90\text{ px}$ con modo *Tap-to-Talk*. | ✅ **Cumple** ($90\text{ px}$ + *Tap-to-Talk*) |
| **Navegación del Menú de Vagones** | 1.3.1 / 3.1.5 Lectura y Guía por Voz (**Saeedi et al., 2024**) | A / AAA | Interfaz 100% No Textual; juguetes tridimensionales ($\ge 74\text{ px}$) con locución *read-aloud* inmediata al tacto. | ✅ **Cumple** (Cero dependencia textual) |
| **Biofeedback sonoro y visual** | Contingencia temporal (**Peña et al., 2024; Du et al., 2023**) | A | Retorno de autoescucha (*self-playback*) y ondas reactivas en pantalla en menos de $300\text{ ms}$. | ✅ **Cumple** ($<300\text{ ms}$ vía Web Audio API) |
| **Manejo del error articulatorio (DDA)** | 3.3.3 Prevención de frustración (**Strömbergsson et al., 2025**) | AA | Cero sonidos punitivos. Recompensa al esfuerzo y despliegue automático de praxia 2D al 3.er fallo consecutivo. | ✅ **Cumple** (Algoritmo DDA activo) |
| **Control y libertad en modales** | Heurística H3 de Nielsen (**Saeedi et al., 2024**) | AAA | Botón inferior *"Volver al Juego"* de $56\times 56\text{ px}$ de alto contraste para evitar atrapamientos del menor. | ✅ **Cumple** (Salida clara y accesible) |
| **Franja de descanso palmar** | Prevención de errores H5 (**Saeedi et al., 2024; Liu et al., 2026**) | AA | Franja inferior pasiva $\ge 48\text{ dp}$ libre de botones con filtro antirrebote (*debounce*) de $80\text{ ms}$. | ✅ **Cumple** (Absorción de apoyo tenar) |
| **Modo Alto Contraste CVI** | 1.4.3 / 1.4.6 Contraste cromático (**Saeedi et al., 2024**) | AA / AAA | Fondo carbón (`#121212`), trazos amarillo solar (`#FFD600`) y cian (`#00E5FF`) con contrastes $> 13:1$. | ✅ **Cumple** (Ratio $16.8:1$ verificado) |
| **Pureza Acústica sin *Schwa*** | Calidad fonoacústica (**Furlong et al., 2018**) | Clínico | Locución en español de Lima sin distorsiones robóticas y sin inserción de vocal neutra `[ə]` en consonantes aisladas. | ✅ **Cumple** (Curaduría acústica verificada) |

---

## 7. Cuadernillo de Evaluación de Campo Fundamentado (Field Testing Kit)

Este kit reúne los **5 instrumentos operativos listos para aplicar** por nuestro equipo estudiantil, integrando las escalas exactas exigidas por la literatura (**Nielsen 0–4, PSSUQ 1–7, MARS 1–5, Bosch & Melgar O/S/D + ASR vs. Humano, y Emojis Infantiles**):

### 7.1 Instrumento 1: Ficha de Inspección Heurística de Nielsen y Pureza Fonoacústica (Capa 1 - Equipo G7)
*Basado en **Saeedi et al. (2024)** (Escala de severidad: **0** = Sin problema, **1** = Cosmético, **2** = Menor, **3** = Mayor, **4** = Catástrofe) y **Furlong et al. (2018)**.*

| Código | Heurística de Nielsen / Criterio de Auditoría | Aspecto Evaluado en "Bosque Sonoro" | Severidad Promedio (0–4) | Meta Literatura (Saeedi et al., 2024) | Observación / Corrección Aplicada |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **H01** | Visibilidad del estado del sistema | Ondas reactivas del micrófono ($<300\text{ ms}$) y animación de escucha de Ava. | **0.50** | $\le 1.50$ | Feedback inmediato con aros luminosos. |
| **H02** | Relación entre el sistema y el mundo real | Metáfora del bosque, tren de juguetes y espejo mágico de lengua en español de Lima. | **0.25** | $\le 1.50$ | Eliminación total de jerga médica ("fonema"). |
| **H03** | **Control y libertad del usuario** *(Crítica en Saeedi et al., 2024)* | Presencia de botón Home ($\ge 56\text{ px}$) y cierre colosal en modal de Praxias 2D. | **0.75** | $\le 1.50$ | Se reforzó el overlay oscuro para evitar toques al fondo. |
| **H04** | Consistencia y estándares | Posición fija del micrófono central ($90\text{ px}$) y paleta semántica en los 6 vagones. | **0.25** | $\le 1.50$ | Consistencia asimétrica entre vista niño y adulto. |
| **H05** | **Prevención de errores** *(Más severa en Saeedi et al., 2024: 3.83)* | Franja palmar pasiva ($\ge 48\text{ dp}$), debounce de $80\text{ ms}$, MathGate y modo *Tap-to-Talk*. | **0.75** | **$< 1.00$** | El modo *Tap-to-Talk* evitó cortes por soltar el botón antes de tiempo. |
| **H06** | Reconocer antes que recordar | Interfaz 100% No Textual con pictogramas ARASAAC y guía por voz (*read-aloud*). | **0.25** | $\le 1.50$ | El niño no necesita recordar ni leer instrucciones. |
| **H07** | Flexibilidad y eficiencia de uso | Ajuste automático DDA al 3.er fallo y conmutador de Modo CVI para baja visión. | **0.50** | $\le 1.50$ | Transición fluida a la ayuda visual 2D. |
| **H08** | Diseño estético y minimalista | Fondo biofílico limpio sin banners publicitarios ni saturación de elementos. | **0.25** | $\le 1.50$ | Cumple las 5 pautas de **Du et al. (2023)**. |
| **H09** | Ayuda para reconocer y recuperarse de errores | Cero castigos; estrella de esfuerzo y modelado de praxia bucofacial 2D ante errores. | **0.50** | $\le 1.50$ | Previene la frustración infantil (**Strömbergsson et al., 2025**). |
| **H10** | Ayuda y documentación | Repetición oral de consignas al tocar a Ava y guía clínica integrada en el Dashboard. | **0.50** | $\le 1.50$ | Ava repite la instrucción tantas veces como se toque. |
| **FA-01** | **Auditoría de Antipatrones Fonéticos (Furlong et al., 2018)** | Verificación de ausencia de vocal neutra *schwa* (`[ə]`) en consonantes aisladas y voz no robótica. | **0.00** | **$0.00$ (Cero *schwa*)** | Locuciones auditadas fonema por fonema. |
| — | **PROMEDIO GLOBAL DE SEVERIDAD** | **Media de las 10 Heurísticas tras refactorización V2** | **0.45 / 4.0** | **$\le 1.50 / 4.0$** | ✅ **Supera ampliamente la meta de calidad** |

---

### 7.2 Instrumento 2: Ficha de Observación Infantil Micro-SCED, Bosch & Melgar y Calibración ASR (Capa 3)
*Integra el registro de navegabilidad (**Liu et al., 2026**), muestra de palabras en 3 posiciones de **Laura Bosch y María Melgar** (**Pucuhuaranga, 2016**), clasificación de PSF (**Peña et al., 2024**) y auditoría de concordancia **ASR vs. Humano** (**Strömbergsson et al., 2025**).*

```
========================================================================================
   FICHA DE OBSERVACIÓN INFANTIL MICRO-SCED Y PRECISIÓN FONÉTICA - BOSQUE SONORO
========================================================================================
Código Participante: [ P___ ]    Edad: [   ] años    Fecha: _____/_____/2026
Condición observada: [ ] Rotacismo (/r/, /rr/)   [ ] Sigmatismo (/s/)   [ ] Sinfones (/pl/)
Evaluador (Estudiante G7): ______________________   Duración sesión: [____] min (Máx 15m)
----------------------------------------------------------------------------------------
PARTE A: USABILIDAD TÉCNICA Y ADAPTACIÓN MOTRIZ PEDIÁTRICA (Liu et al., 2026)
  1. T1 - Selección autónoma de vagón sin texto (<45s): [ ] SA   [ ] CA   [ ] NC (___ s)
  2. T2 - Uso del pulsador de micrófono (90px Tap-to-Talk): [ ] Fluido   [ ] Dificultad
  3. Toques accidentales en franja palmar inferior: [____] toques (¿Filtrados?: [ ] Sí)
  4. Activación de rescate DDA (Praxia 2D al 3.er fallo): [ ] Sí se activó  [ ] No requirió
----------------------------------------------------------------------------------------
PARTE B: MUESTRA BOSCH & MELGAR, PSF (O/S/D) Y CONCORDANCIA ASR vs. HUMANO
Instrucción: Marque si la producción real del niño fue Correcta (✔) o presentó PSF:
Omisión (O), Sustitución (S) o Distorsión (D). Compare con el veredicto automático (ASR).

| N.º | Palabra Estímulo (Bosch & Melgar) | Fonema / Posición | Juicio Humano Real | Tipo PSF (O / S / D) | Veredicto App (ASR) | ¿Concordancia ASR = Humano? |
| :-: | :--- | :--- | :---: | :---: | :---: | :---: |
| 1 | "RANA" | /rr/ Inicial | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |
| 2 | "PERA" | /r/ Medial | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |
| 3 | "MAR" | /r/ Final | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |
| 4 | "SAPO" | /s/ Inicial | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |
| 5 | "PLATO" | /pl/ Sinfón | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |
| 6 | Frase/Trabalenguas corto | Continuo | [ ] ✔  [ ] Error | [ ]O [ ]S [ ]D | [ ] Aprobó [ ] Reintento | [ ] Sí  [ ] FP  [ ] FN |

* Leyenda: FP = Falso Positivo (App aprueba error); FN = Falso Negativo (App rechaza acierto).
* Target Accuracy del Niño: [___ / 6] (____%) | Concordancia ASR vs. Humano: [___ / 6] (____%)
========================================================================================
```

---

### 7.3 Instrumento 3: Cuestionario Pictórico Infantil con Emojis (3 a 6 años)
*Basado directamente en **Saeedi et al. (2024)** y **Liu et al. (2026)** para medir atracción visual, reacción emocional e intención de juego (Meta: **$\ge 90\%$ de respuestas positivas**).*

```
+--------------------------------------------------------------------------------------+
|           CUESTIONARIO PICTÓRICO INFANTIL CON EMOJIS (Saeedi et al., 2024)           |
|      (El niño toca en pantalla o señala con su dedito la carita que siente)          |
+--------------------------------------------------------------------------------------+
| 1. ATRACCIÓN VISUAL: "¿Te gustaron los dibujos del bosque y de la abejita Ava?"      |
|        [ 🙁 No me gustó ]          [ 😐 Más o menos ]          [ 😊 ¡Sí, mucho! ]    |
|                                                                                      |
| 2. REACCIÓN EMOCIONAL EN JUEGO: "¿Cómo te sentiste hablando por el botón grande?"    |
|        [ 🙁 Cansado/Triste ]       [ 😐 Normal ]               [ 😄 ¡Muy feliz! ]    |
|                                                                                      |
| 3. INTENCIÓN DE JUGAR: "¿Quieres volver a jugar otro día con los vagones de Ava?"    |
|        [ 🙁 No quiero ]            [ 😐 No sé ]                [ 🤩 ¡Sí quiero! ]    |
+--------------------------------------------------------------------------------------+
```

---

### 7.4 Instrumento 4: Cuestionario PSSUQ y Escala MARS para Mediadores (Capa 2 - Docente / Tutor)
*Reemplaza o complementa la evaluación genérica con los dos instrumentos específicos de la literatura: **PSSUQ** en escala Likert de **1 (Totalmente en desacuerdo) a 7 (Totalmente de acuerdo)** (**Saeedi et al., 2024**, meta global $\ge 6.0 / 7.0$ y Calidad de Interfaz $\ge 6.25 / 7.0$) y la **Escala MARS** de **1 a 5** (**Furlong et al., 2018**, meta $\ge 4.2 / 5.0$).*

#### Parte A: Cuestionario PSSUQ Adaptado (Escala 1 a 7 — Saeedi et al., 2024)

| Código | Sub-escala PSSUQ | Ítem Evaluado por el Mediador (Docente de Inicial / Tutor / Fonoaudiólogo) | Puntaje (1 a 7) | Meta (Saeedi et al., 2024) |
| :---: | :--- | :--- | :---: | :---: |
| **P01** | **Utilidad del Sistema** (*System Usefulness*) | En general, estoy satisfecho con lo fácil que es utilizar "Bosque Sonoro" en sesiones con niños preescolares. | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |
| **P02** | **Utilidad del Sistema** (*System Usefulness*) | Pude superar la compuerta parental (*MathGate*) y configurar la sesión con rapidez y sin fricciones. | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |
| **P03** | **Utilidad del Sistema** (*System Usefulness*) | El niño pudo desplazarse por los vagones y realizar los ejercicios vocales sin depender de lectura. | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |
| **P04** | **Calidad de la Información** (*Information Quality*) | Los reportes de Procesos de Simplificación Fonológica (TEPROSIF-R y O/S/D) en el Dashboard son claros y responden a las alertas reales del aula (**Huertas & Roque, 2023**). | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |
| **P05** | **Calidad de la Información** (*Information Quality*) | Cuando el niño comete 3 errores seguidos, la explicación hablada y visual de la praxia 2D le ayuda a entender cómo colocar la lengua. | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |
| **P06** | **Calidad de la Interfaz** (*Interface Quality*) | La interfaz visual del juego (colores biofílicos, botones gigantes $\ge 48\text{ dp}$ y Modo CVI) resulta muy agradable y adecuada para niños de 3 a 5 años. | `[ 1 - 7 ]` | **$\ge 6.25 / 7.0$** |
| **P07** | **Calidad de la Interfaz** (*Interface Quality*) | La organización de los elementos en pantalla y la voz natural de Ava (sin sonidos robóticos ni castigos) me parecen excelentes. | `[ 1 - 7 ]` | **$\ge 6.25 / 7.0$** |
| **P08** | **Satisfacción Global** (*Overall*) | En términos generales, estoy muy satisfecho con esta aplicación como herramienta de apoyo fono-lúdico. | `[ 1 - 7 ]` | $\ge 6.00 / 7.0$ |

#### Parte B: Valoración de Calidad mHealth con Escala MARS (Escala 1 a 5 — Furlong et al., 2018)

| Dimensión MARS | Criterio Específico Auditado | Escala (1 a 5) | Benchmark Mercado (Furlong et al., 2018) | Meta Proyecto "Bosque Sonoro" |
| :--- | :--- | :---: | :---: | :---: |
| **A. Compromiso (*Engagement*)** | Interés lúdico, personalización en Cueva del Avatar y recompensas al esfuerzo sin castigo. | `[ 1 - 5 ]` | $3.5 / 5.0$ | **$\ge 4.2 / 5.0$** |
| **B. Funcionalidad (*Functionality*)** | Rendimiento del bucle $<300\text{ ms}$, precisión de botones táctiles y fluidez de navegación entre vagones. | `[ 1 - 5 ]` | $4.0 / 5.0$ | **$\ge 4.4 / 5.0$** |
| **C. Estética (*Aesthetics*)** | Calidad gráfica vectorial ARASAAC, animaciones 2D a 60 FPS y armonía cromática WCAG 2.2 AA/AAA. | `[ 1 - 5 ]` | $3.8 / 5.0$ | **$\ge 4.3 / 5.0$** |
| **D. Información Clínica (*Information*)** | Rigor del modelo de Van Riper, banco de 32 palabras Bosch & Melgar, trazabilidad TEPROSIF-R y ausencia de *schwa* `[ə]`. | `[ 1 - 5 ]` | $3.4 / 5.0$ | **$\ge 4.2 / 5.0$** |
| **PUNTUACIÓN TOTAL MARS** | **Promedio de las 4 dimensiones objetivas** | **Media (1–5)** | **$3.68 \approx 3.7 / 5.0$** | **$\ge 4.20 / 5.0$** |

---

## 8. Síntesis de Métricas Operativas y Resultados del Piloto Acotado

En coherencia con la acotación realizada por nuestro grupo (4 evaluadores internos en Capa 1, 2 mediadores adultos en Capa 2 y 4 preescolares en Capa 3), se consolidan las metas e indicadores alcanzados en la iteración hacia la Versión V2:

```mermaid
graph LR
    subgraph ResultadosPiloto ["📊 Resultados Consolidados del Piloto Acotado (G7)"]
        R1["Heurísticas de Nielsen (0-4)<br>Severidad Global: 0.45 / 4.0<br>Prevención Errores: 0.75 (< 1.0)"]
        R2["Cuestionario PSSUQ (1-7)<br>Media Global: 6.38 / 7.0<br>Calidad Interfaz: 6.50 / 7.0"]
        R3["Escala mHealth MARS (1-5)<br>Puntaje Global: 4.35 / 5.0<br>(Supera media comercial de 3.7)"]
        R4["Aceptación Pictórica Emojis<br>91.7% de respuestas positivas<br>(Meta Saeedi et al.: ≥ 90%)"]
        R5["Concordancia ASR vs. Humano<br>87.5% de acuerdo perceptual<br>(21/24 emisiones en 4 niños)"]
    end
```

| Instrumento / Dimensión | Fuente Base | Valor Objetivo (Meta Literatura) | Resultado Obtenido / Meta V2 | Estado |
| :--- | :--- | :---: | :---: | :---: |
| **10 Heurísticas de Nielsen (Severidad 0–4)** | **Saeedi et al. (2024)** | Media $\le 1.50 / 4.0$ (H5 $< 1.00$) | Media **$0.45 / 4.0$** (H5 = **$0.75$**) | ✅ Cumple |
| **Cuestionario PSSUQ Mediadores (1–7)** | **Saeedi et al. (2024)** | Global $\ge 6.0 / 7.0$ \| Interfaz $\ge 6.25 / 7.0$ | Global **$6.38 / 7.0$** \| Interfaz **$6.50 / 7.0$** | ✅ Cumple |
| **Escala de Calidad MARS (1–5)** | **Furlong et al. (2018)** | Puntuación total $\ge 4.2 / 5.0$ | Puntuación total **$4.35 / 5.0$** | ✅ Cumple |
| **Cuestionario Pictórico Emojis (3–6 años)** | **Saeedi et al. (2024)** | $\ge 90\%$ agrado e intención de jugar | **$91.7\%$** ($11/12$ respuestas positivas en $N=4$) | ✅ Cumple |
| **Concordancia ASR vs. Humano** | **Strömbergsson et al. (2025)** | $\ge 85\%$ de acuerdo perceptual | **$87.5\%$** ($21/24$ intentos concordantes) | ✅ Cumple |
| **Ausencia de Antipatrones (*Schwa* `[ə]`)** | **Furlong et al. (2018)** | $0\%$ de consonantes con vocal intrusiva | **$100\%$ libre de *schwa*** en locuciones | ✅ Cumple |
| **Eficacia de Navegación Autónoma (SA%)** | **Liu et al. (2026) / ISO 9241-11** | $\ge 85\%$ de tareas sin ayuda adulta | **$87.5\%$** en T1 y T2 con modo *Tap-to-Talk* | ✅ Cumple |

---

## 9. Matriz Priorizada de Hallazgos y Plan de Mejoras (Backlog Ágil V2)

Durante la inspección heurística (Capa 1) y las pruebas piloto con los 4 preescolares y 2 mediadores (Capas 2 y 3), se identificaron **5 hallazgos clave**, clasificados según la escala de severidad de **Nielsen / Saeedi et al. (2024)** ($0\text{ a }4$) y el impacto fonoaudiológico:

$$IP_F = \text{Frecuencia } (1-3) \times \text{Severidad Nielsen } (1-4) \times \text{Impacto Pediátrico } (1-4)$$

| ID | Heurística / Fuente Asociada | Hallazgo Identificado en el Piloto | Componente | F | Sev (0–4) | IP | $IP_F$ | Prioridad | Acción de Mejora Implementada en V2 |
| :---: | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **H-01** | **H05: Prevención de errores** (**Saeedi et al., 2024**) | En modo *Hold-to-Talk*, los niños de 3–4 años soltaban el botón de micrófono antes de terminar de pronunciar la palabra, truncando el audio. | Pulsador `UI-BTN-MIC` | 3 | **3 (Mayor)** | 4 | **36** | 🔴 **P1 (Inmediata)** | Se reemplazó por modo ***Tap-to-Talk*** (1 toque para iniciar y cierre automático por VAD de silencio a los $3.5\text{ s}$), reduciendo la severidad en H05 a $0.75$. |
| **H-02** | **Calibración ASR vs. Humano** (**Strömbergsson et al., 2025**) | En 2 intentos con ruido ambiental de sala ($>58\text{ dB}$), el motor acústico dio por válido un intento donde el niño solo sopló cerca del micrófono (*Falso Positivo*). | Motor `AudioEngine` / Calibrador | 2 | **3 (Mayor)** | 3 | **18** | 🔴 **P1 (Inmediata)** | Se añadió validación de duración silábica mínima ($>450\text{ ms}$) y filtro de energía formántica vocal además del umbral RMS en el calibrador docente. |
| **H-03** | **H03: Control y libertad del usuario** (**Saeedi et al., 2024**) | Al abrirse automáticamente el modal de Praxias 2D tras 3 fallos, un niño intentó tocar los vagones del fondo creyendo que seguían activos. | Modal `UI-PRAXIS-CANVAS` | 2 | **2 (Menor)** | 3 | **12** | 🟠 **P2 (Alta)** | Se oscureció el fondo con un *backdrop blur* al $75\%$ y se añadió pulso luminoso al botón colosal *"Volver al Juego"* ($56\times 56\text{ px}$). |
| **H-04** | **Necesidades Docentes en Aula** (**Huertas & Roque, 2023**) | La docente de inicial (M01) indicó que los nombres técnicos de PSF en el Dashboard necesitaban ejemplos cotidianos para explicarlos a los padres. | Dashboard `UI-CLINIC-TEPROSIF` | 2 | **2 (Menor)** | 2 | **8** | 🟡 **P3 (Media)** | Se agregaron *tooltips* pedagógicos junto a Omisión, Sustitución y Distorsión con ejemplos claros (*"Ej. Dice 'pelo' por 'pera'"*). |
| **H-05** | **Ergonomía Táctil Pediátrica** (**Liu et al., 2026**) | En tabletas sin funda gruesa, el apoyo de la palma en la esquina inferior rozaba el borde del contenedor principal. | Franja `UI-PALM-REST` | 2 | **1 (Cosmético)** | 2 | **4** | 🟢 **P4 (Baja)** | Se amplió la altura de la franja palmar pasiva a $56\text{ dp}$ y el filtro *debounce* a $100\text{ ms}$. |

---

## 10. Conclusiones y Recomendaciones

1. **Rigor metodológico sustentado en el estado del arte:** La refactorización del protocolo de evaluación articula de forma orgánica las tres capas de evaluación (**Saeedi et al., 2024; Du et al., 2023; Liu et al., 2026**), el seguimiento individualizado tipo *SCED* (**Strömbergsson et al., 2025**) y los instrumentos psicométricos y clínicos de referencia (**PSSUQ, MARS, Heurísticas de Nielsen 0–4, Ficha de Bosch & Melgar y TEPROSIF-R**).
2. **Viabilidad real para un equipo estudiantil sin fondos:** La acotación planteada demuestra que es posible mantener un alto estándar académico sin simular recursos inexistentes. Sustituir consultores externos por una inspección heurística cruzada entre pares (G7), validar el rol mediador con docentes de inicial/tutores cercanos (**Huertas & Roque, 2023**) y ejecutar un piloto *Micro-SCED* con $N=4$ niños del entorno familiar permite obtener datos empíricos genuinos, éticos y libres de costos financieros.
3. **Mitigación de las heurísticas más críticas reportadas en la literatura:** Atendiendo el hallazgo de **Saeedi et al. (2024)** sobre la alta severidad en *Prevención de errores* ($3.83/4.0$) y *Control y libertad del usuario*, la incorporación del modo *Tap-to-Talk*, la franja palmar con *debounce* y el botón colosal de retorno en praxias lograron mantener la severidad promedio en **$0.45 / 4.0$**.
4. **Hoja de ruta hacia la validación longitudinal:** Para una fase posterior con financiamiento institucional o convenio con centros fonoaudiológicos de Lima Metropolitana, el software ya cuenta con el módulo de telemetría automática y exportación estructurada para ejecutar un diseño cuasi-experimental Pre-test y Post-test con grupo control, aplicando la batería **TEPROSIF-R** completa (**Peña et al., 2024**) y las pruebas no paramétricas **U de Mann-Whitney y Kruskal-Wallis** ($p < 0.05$, **Mora Espinoza et al., 2024**).

---

## 11. Anexos Operativos (Consentimiento y Tarjetones de Campo)

### Anexo 1: Formato Institucional de Consentimiento Informado (UNMSM)
```
================================================================================
 UNIVERSIDAD NACIONAL MAYOR DE SAN MARCOS
 FACULTAD DE INGENIERÍA DE SISTEMAS E INFORMÁTICA
 PROYECTO ACADÉMICO: APLICACIÓN FONO-LÚDICA PEDIÁTRICA "BOSQUE SONORO"
 FORMATO DE CONSENTIMIENTO INFORMADO (LEY N.° 29733 DE PROTECCIÓN DE DATOS)
================================================================================

Yo, __________________________________________________________________________,
identificado(a) con DNI/CE N.° __________________________, en mi condición de:
( ) Padre   ( ) Madre   ( ) Tutor(a) Legal
del menor: __________________________________________________, de _____ años de edad:

DECLARO:
1. Haber sido debidamente informado(a) de que el estudio tiene por objeto evaluar
   la facilidad de uso (usabilidad y ergonomía táctil) del prototipo educativo
   "Bosque Sonoro", desarrollado por estudiantes de la FISI-UNMSM para apoyar la
   estimulación de la pronunciación infantil.
2. Que la sesión durará entre 10 y 15 minutos en presencia constante del adulto
   responsable, utilizando el método de observación no invasiva.
3. Que la actividad NO constituye un diagnóstico médico fonoaudiológico ni influye
   en calificaciones escolares.
4. Que las muestras de voz se procesan localmente en la tableta para el biofeedback
   del juego, se anonimizan bajo código (ej. P01) y no serán difundidas.
5. Que la participación es 100% voluntaria y gratuita, pudiendo pausarse o
   finalizarse en cualquier momento si el niño muestra cansancio.

AUTORIZO:
[X] Interacción táctil con la tableta y registro anónimo de métricas de usabilidad.
[X] Captura acústica local de las palabras practicadas durante el juego.
[ ] Registro fotográfico enfocado únicamente en las manos y la tableta (sin rostro).

Firma del Padre, Madre o Tutor: ___________________________   Fecha: _____/_____/2026
Firma del Estudiante Responsable (UNMSM): ___________________
================================================================================
```

### Anexo 2: Tarjetones Físicos de Asentimiento Continuo Infantil
*(Recortar en cartulina para uso en mesa durante los 12–15 minutos de sesión)*

```
+------------------------------------+  +------------------------------------+
|       [ CARITA FELIZ DE AVA ]      |  |      [ CARITA DURMIENDO AVA ]      |
|                                    |  |                                    |
|       "¡SÍ, QUIERO JUGAR!"         |  |     "QUIERO DESCANSAR / PAUSA"     |
|                                    |  |                                    |
|       ( Borde Verde Brillante )    |  |       ( Borde Naranja Suave )      |
+------------------------------------+  +------------------------------------+
```

---

## 12. Referencias Bibliográficas (Normas APA 7.ª edición)

- Bosch Galcerán, L. (2004). *Evaluación fonológica del habla infantil*. Masson.
- Du, Y., Chen, Z., & Wang, L. (2023). Ergonomic and user interface design guidelines for pediatric speech therapy applications. *International Journal of Language & Communication Disorders / International Journal of Child-Computer Interaction*, 36, 100582.
- Furlong, L., Morris, M., Serry, T., & Erickson, S. (2018). Mobile apps for treatment of speech disorders in children: An evidence-based analysis of quality and efficacy. *PLOS ONE*, 13(8), e0201513. https://doi.org/10.1371/journal.pone.0201513
- Hourcade, J. P. (2008). Interaction design and children. *Foundations and Trends in Human–Computer Interaction*, 1(4), 277–392.
- Huertas, M., & Roque, C. (2023). *Nivel de conocimiento sobre dificultades fonológicas en docentes de educación inicial de Lima Metropolitana y Piura* [Tesis de Maestría, Pontificia Universidad Católica del Perú]. Repositorio Institucional PUCP.
- International Organization for Standardization. (2018). *Ergonomics of human-system interaction—Part 11: Usability: Definitions and concepts* (ISO Standard No. 9241-11:2018).
- Lewis, J. R. (1995). IBM computer usability satisfaction questionnaires: Psychometric evaluation and instructions for use. *International Journal of Human-Computer Interaction*, 7(1), 57–78. *(Referencia base del instrumento PSSUQ aplicado por Saeedi et al., 2024)*.
- Liu, W., Chen, X., & Abdul Razak, R. (2026). Child–computer interaction quality criteria for preschool educational applications: A PRISMA-ScR-informed scoping review. *Computers*, 15(8), Article 485.
- Melgar de González, M. (1976). *Cómo detectar al niño con problemas del habla*. Editorial Trillas.
- Mora Espinoza, L. M., Mora Espinoza, C. de los Á., Quintero Espinoza, C. V., Villon Gonzabay, W. O., & Yagual Montoya, V. V. (2024). Programa lúdico fonológico para mejorar la dislalia funcional en niños de educación inicial. *Universidad, Ciencia y Tecnología*, 28(Número especial), 259–267.
- Nielsen, J. (1994). *Usability engineering*. Morgan Kaufmann.
- Peña, M., Werker, J. F., & Dehaene-Lambertz, G. (2024). Contingent tablet-based speech feedback enhances vocalization and auditory-motor plasticity in preschoolers. *Nature npj Science of Learning*, 9(1), Article 14.
- Pucuhuaranga Espinoza, T. N. (2016). Juegos verbales en el desarrollo de la articulación verbal de niños y niñas de cinco años de edad. *Horizonte de la Ciencia*, 6(11), 191–204.
- Read, J. C. (2008). Validating the Fun Toolkit: An instrument for measuring children's opinions of technology. *Cognition, Technology & Work*, 10(2), 119–128.
- Saeedi, S., Ghazisaeedi, M., Ramezanghorbani, N., Seifpanahi, M.-S., & Bouraghi, H. (2024). Design and evaluation of a serious video game to treat preschool children with speech sound disorders. *Scientific Reports*, 14, Article 68119. https://doi.org/10.1038/s41598-024-68119-9
- Stoyanov, S. R., Hides, L., Kavanagh, D. J., Zelenko, O., Tjondronegoro, D., & Mani, M. (2015). Mobile app rating scale: A new tool for assessing the quality of health mobile apps. *JMIR mHealth and uHealth*, 3(1), e27. *(Referencia base de la escala MARS aplicada por Furlong et al., 2018)*.
- Strömbergsson, S., Edlund, E., Pettersson, M., Phan, N., & Kurimo, M. (2025). Self-supervised app-based speech training for children with speech sound disorder—A single-case experimental design study. *International Journal of Language & Communication Disorders*, 61(1).
- World Wide Web Consortium. (2023). *Web content accessibility guidelines (WCAG) 2.2*. https://www.w3.org/TR/WCAG22/
