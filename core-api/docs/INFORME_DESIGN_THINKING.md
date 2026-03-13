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