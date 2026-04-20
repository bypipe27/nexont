# INFORME DE DESIGN THINKING

## Proyecto
**Nexont: Plataforma de compra y venta de artículos usados con soporte de chat en tiempo real e IA**

## Integrantes
- Felipe Ortiz Calan - 2380642
- Santiago Hernández Aguado - 2380367
- Natalia Martínez Castañeda - 2380414
- Julian Andres Rojas Palacio - 2459687

## Fecha
9 de marzo de 2026

---

## Resumen 
Este informe presenta la aplicación del enfoque de Design Thinking en Nexont, manteniendo el flujo metodológico solicitado: **Empatizar, Definir, Idear, Prototipar y Testear**. La evidencia de encuesta muestra que la principal barrera de adopción en compraventa C2C de segunda mano es la **desconfianza en pago y entrega**, seguida por fricción en verificación y falta de señales de transparencia.

Con base en estos hallazgos, se priorizó una solución MVP de **chat en tiempo real + asistencia IA** para reducir incertidumbre en momentos críticos, apoyada por artefactos visuales (UML, wireframes y mockups) que permiten validar rápidamente hipótesis de confianza.

---

## Mapa de lectura del informe
1. **Empatizar:** evidencia y hallazgos de encuesta (con capturas por pregunta).
2. **Definir:** síntesis, problema central, HMW y criterios de diseño.
3. **Idear:** alternativas evaluadas y decisión del MVP.
4. **Prototipar:** evidencia de UML, wireframes y mockups ya implementados.
5. **Testear:** plan de validación e iteración del producto.

---

# 1. Empatizar

## 1.1 Objetivo de la fase
Comprender qué factores generan abandono o desconfianza en usuarios de plataformas de compra y venta de segunda mano, para orientar el diseño del MVP de Nexont hacia necesidades reales.

## 1.2 Técnica aplicada
Se aplicó una **encuesta estructurada** en Google Forms con preguntas cerradas y abiertas enfocadas en:
- Experiencia previa en compraventa online.
- Puntos de fricción del proceso.
- Factores de confianza/desconfianza.
- Valor percibido de funcionalidades propuestas (chat e IA).

## 1.3 Muestra
- Número de respuestas: **4**.
- Participantes: potenciales compradores/vendedores de plataformas de segunda mano.
- Frecuencia de uso declarada: principalmente **ocasional**.

## 1.4 Panel rápido de hallazgos
| Indicador clave | Resultado observado | Interpretación |
|---|---|---|
| Riesgo principal | Pago (**75%**) | El usuario teme perder dinero antes de concretar compra. |
| Riesgo secundario | Entrega (**50%**) | Duda sobre cumplimiento y trazabilidad de envío. |
| Onboarding | Percepción media (≈ 3/5) | El flujo actual requiere más claridad y feedback. |
| Valor de funciones | Chat + IA valorados positivamente | Hay apertura a soporte conversacional en tiempo real. |

## 1.5 Evidencia de encuesta por pregunta (capturas)

### Pregunta 1
![Resultado encuesta - Pregunta 1](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-44-12.png)

### Pregunta 2
![Resultado encuesta - Pregunta 2](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-45-02.png)

### Pregunta 3
![Resultado encuesta - Pregunta 3](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-45-20.png)

### Pregunta 4
![Resultado encuesta - Pregunta 4](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-45-44.png)

### Pregunta 5
![Resultado encuesta - Pregunta 5](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-46-15.png)

### Pregunta 6
![Resultado encuesta - Pregunta 6](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-46-42.png)

### Pregunta 7
![Resultado encuesta - Pregunta 7](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-47-16.png)

### Pregunta 8
![Resultado encuesta - Pregunta 8](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-47-36.png)

### Pregunta 9
![Resultado encuesta - Pregunta 9](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-48-12.png)

### Pregunta 10
![Resultado encuesta - Pregunta 10](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-48-36.png)

### Pregunta 11
![Resultado encuesta - Pregunta 11](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-49-26.png)

### Pregunta 12
![Resultado encuesta - Pregunta 12](../img/Captura%20de%20pantalla%20de%202026-03-09%2016-50-05.png)

## 1.6 Hallazgos sintetizados
### a) Riesgos percibidos
- Mayor desconfianza en **pago** y **entrega**.
- Preocupación por información insuficiente del vendedor.

### b) Fricción de onboarding
- Registro/verificación con percepción media.
- Oportunidad de simplificar pasos y reforzar retroalimentación.

### c) Necesidades de confianza
- Información clara del producto.
- Evidencias (fotos/videos y estado real).
- Reseñas/referencias del vendedor.
- Datos básicos para validación de identidad.

### d) Valor de funcionalidades propuestas
- El **chat en tiempo real** ayuda a resolver dudas de forma inmediata.
- El **asistente IA** se percibe útil para seguridad y toma de decisión.

## 1.7 Conclusión de Empatizar
La necesidad principal no es solo rapidez de compra/venta, sino **reducción de incertidumbre operativa** en puntos críticos de transacción.

---

# 2. Definir

## 2.1 Síntesis de insights
1. Los usuarios abandonan cuando perciben alto riesgo financiero y logístico.
2. La información incompleta del vendedor/producto incrementa la desconfianza.
3. El flujo de registro/verificación requiere mayor claridad para reducir fricción.
4. Existe disposición positiva hacia mecanismos de acompañamiento (chat + IA).

## 2.2 Necesidad central
Los usuarios necesitan **mecanismos de confianza visibles y accionables** durante todo el recorrido: descubrimiento, negociación y cierre.

## 2.3 Formulación del problema
En plataformas de compraventa de segunda mano, los usuarios enfrentan barreras de confianza en momentos críticos (especialmente pago y entrega), lo cual reduce la intención de completar transacciones.

## 2.4 Problem Statement
**Usuarios compradores y vendedores de artículos usados** necesitan **validar rápidamente la seguridad y confiabilidad de la operación (pago, entrega, reputación e información del producto)** porque **la percepción de riesgo y la falta de señales claras de confianza provocan dudas y abandono**.

## 2.5 Preguntas de oportunidad (How Might We)
- ¿Cómo podríamos disminuir la percepción de riesgo en pago y entrega antes de que el usuario abandone?
- ¿Cómo podríamos hacer más confiable y transparente la interacción entre comprador y vendedor?
- ¿Cómo podríamos usar asistencia conversacional para reducir dudas en tiempo real sin aumentar fricción?

## 2.6 Trazabilidad hallazgo → decisión de diseño
| Hallazgo de Empatizar | Decisión de diseño | Resultado esperado |
|---|---|---|
| Alto temor en pago | Mostrar estados de seguridad y confirmaciones visibles | Menor abandono en checkout/acuerdo |
| Dudas sobre entrega | Clarificar seguimiento y estado de orden | Mayor percepción de control |
| Información incompleta | Checklist de confianza en producto/perfil | Mayor transparencia |
| Necesidad de soporte inmediato | Chat + IA contextual | Resolución de dudas en tiempo real |

## 2.7 Criterios de diseño
- Transparencia de información del producto y perfil.
- Comunicación directa, rápida y trazable entre partes.
- Asistencia contextual para dudas en puntos críticos.
- Flujo simple de registro/verificación con feedback claro.

---

# 3. Idear

## 3.1 Alternativas de solución

### Alternativa A: Flujo seguro de transacción + verificación reforzada
Incluye validaciones estrictas de identidad y controles de operación.

- **Ventaja:** ataca directamente riesgo percibido.
- **Riesgo/costo:** esfuerzo alto de implementación inicial.

### Alternativa B: Chat en tiempo real + checklist de confianza
Integra conversación comprador-vendedor y verificación visible por etapas.

- **Ventaja:** reduce incertidumbre en negociación y acelera decisión.
- **Riesgo/costo:** esfuerzo medio; depende de UX clara.

### Alternativa C: Asistente IA para dudas de seguridad/calidad
Asistente para preguntas frecuentes, riesgos comunes y recomendaciones.

- **Ventaja:** soporte escalable e inmediato.
- **Riesgo/costo:** control de calidad de respuestas.

## 3.2 Matriz de priorización (impacto vs esfuerzo)
| Alternativa | Impacto | Esfuerzo | Prioridad |
|---|---|---|---|
| A | Alto | Alto | Media |
| B | Alto | Medio | Alta |
| C | Medio-Alto | Medio | Alta |

## 3.3 Solución seleccionada para MVP
Se selecciona **B + C**:
1. Chat en tiempo real para negociación y resolución de dudas.
2. Asistente IA para soporte contextual de confianza y seguridad.

## 3.4 Justificación técnica
La combinación B + C permite atacar el problema de confianza sin bloquear el avance del MVP por complejidad. Además, se alinea con la arquitectura actual:
- Frontend: interacción y experiencia de usuario.
- Chat service: mensajería en tiempo real.
- Chatbot service: asistencia contextual IA.
- Core API: autenticación y orquestación de datos.

---

# 4. Prototipar

## 4.1 Objetivo de la fase
Representar visual y técnicamente la solución B + C para validar reducción de incertidumbre en pago/entrega y mejora de confianza percibida.

## 4.2 Evidencia de prototipos implementados

### A) Wireframes
- Archivo base: [wireframes-desktop.jsx](./wireframes-desktop.jsx)
- Cobertura de pantallas:
	1. Publicación de producto.
	2. Detalle de producto con señales de confianza.
	3. Chat comprador-vendedor con soporte IA.
	4. Estado de orden (seguimiento pago/entrega).

### B) Mockups
- Archivo base (versión light): [nexont-mockups-desktop-light.jsx](./nexont-mockups-desktop-light.jsx)
- Cobertura:
	- Mockup 1: detalle de producto.
	- Mockup 2: chat C2C + IA.

### C) Diagramas UML
- Archivo base (versión light): [nexont-uml-diagrams-light.jsx](./nexont-uml-diagrams-light.jsx)
- Cobertura:
	- Diagrama de casos de uso (comprador y vendedor).
	- Diagrama de secuencia (consulta → chat → acuerdo → confirmación).

### D) Wireframes baja fidelidad
- Archivo base: [nexont-wireframes-lofi.jsx](./nexont-wireframes-lofi.jsx)

## 4.3 Mapa de trazabilidad (hallazgo ↔ artefacto)
| Hallazgo | Artefacto de prototipo | Elemento visual implementado |
|---|---|---|
| Riesgo en pago | UML secuencia + pantalla de orden | Estados de pago y confirmación |
| Riesgo en entrega | Wireframes de estado de orden | Seguimiento visible de etapas |
| Dudas en negociación | Chat wireframe/mockup | Conversación en tiempo real |
| Incertidumbre de decisión | Asistente IA en mockups | Soporte contextual por flujo |

## 4.4 Convención de evidencia
- La fuente de verdad de diseño son los archivos JSX del repositorio.
- Las capturas estáticas se usan para soporte de presentación académica.
- Cualquier ajuste visual se actualiza primero en JSX y luego en este informe.

## 4.5 Criterio de calidad de la fase
La fase se considera cerrada cuando cada artefacto responde explícitamente a un hallazgo de Empatizar y a un criterio definido en Definir.

---

# 5. Testear

## 5.1 Objetivo de la fase
Validar si la solución B + C mejora confianza percibida, reduce dudas y facilita tareas críticas de compra/venta.

## 5.2 Plan de prueba con usuarios

### Participantes sugeridos
- Entre 5 y 8 usuarios con perfil comprador/vendedor.

### Tareas sugeridas
1. Encontrar un producto y revisar señales de confianza.
2. Iniciar conversación por chat para aclarar una duda crítica.
3. Usar asistente IA para validar una inquietud de seguridad.
4. Confirmar intención de continuar la transacción.

### Métricas mínimas
- Tasa de éxito por tarea.
- Tiempo promedio por tarea.
- Satisfacción percibida (escala 1–5).
- Dudas frecuentes detectadas (cualitativo).

## 5.3 Base actual de retroalimentación
La encuesta inicial ya evidencia:
- Prioridad en controles de confianza de pago/entrega.
- Necesidad de información verificable.
- Valoración positiva de chat e IA como soporte de decisión.

## 5.4 Cambios priorizados tras pruebas
1. Indicadores explícitos de seguridad en puntos de pago/entrega.
2. Checklist de confianza visible en perfil y producto.
3. Guías contextuales del asistente IA según etapa del proceso.
4. Mensajes de estado claros durante pasos críticos.

## 5.5 Matriz de iteración
| Hallazgo de prueba | Cambio aplicado/propuesto | Impacto esperado | Estado |
|---|---|---|---|
| Duda sobre seguridad de pago | Etiquetas y estados de seguridad visibles | Menor abandono en cierre | En progreso |
| Incertidumbre sobre entrega | Timeline de orden con hitos claros | Mayor confianza post-pago | En progreso |
| Dudas repetitivas en negociación | Respuestas guiadas con IA en contexto | Menor carga cognitiva | En progreso |

## 5.6 Cierre de la fase
El valor de Testear está en demostrar iteración real: **feedback recibido → cambio aplicado → nueva validación**.

---

# Conclusiones generales
1. El desafío principal de Nexont es de **confianza transaccional**, más que de funcionalidad básica.
2. La evidencia de Empatizar orienta correctamente el diseño hacia pago, entrega y transparencia.
3. La combinación **B + C (chat + IA)** es coherente con impacto esperado y viabilidad técnica del MVP.
4. UML, wireframes y mockups permiten validar hipótesis de manera rápida y trazable.
5. El siguiente salto de calidad depende de cerrar el ciclo completo: evidencia → decisión → prototipo → prueba → ajuste.

---