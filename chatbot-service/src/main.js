
import express from 'express';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';
import { SYSTEM_PROMPTS } from './prompt.js';
import { TOOLS_COMPRADOR, TOOLS_VENDEDOR } from './tools.js';
import * as queries from './queries.js';

dotenv.config();
const app = express();
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const TOOL_HANDLERS = {
  buscar_productos:              queries.buscarProductos,
  obtener_detalle_producto:      queries.obtenerDetalleProducto,
  obtener_productos_similares:   queries.obtenerProductosSimilares,
  obtener_mis_productos:         queries.obtenerMisProductos,
  obtener_estadisticas_vendedor: queries.obtenerEstadisticasVendedor,
  analizar_competencia:          queries.analizarCompetencia,
  sugerir_precio:                queries.sugerirPrecio,
};


function convertirTools(tools) {
  return tools.map(t => ({
    type: 'function',
    function: {
      name:        t.name,
      description: t.description,
      parameters:  t.input_schema,
    },
  }));
}

export async function chat({ rol, historial = [], mensaje, contexto = {} }) {
  const tools        = rol === 'comprador' ? TOOLS_COMPRADOR : TOOLS_VENDEDOR;
  const systemPrompt = SYSTEM_PROMPTS[rol];

  const system = contexto.usuario_id
    ? `${systemPrompt}\n\nUSUARIO ACTUAL: ${contexto.nombres || 'Cliente'} (ID: ${contexto.usuario_id})`
    : systemPrompt;

  const mensajes = [
    { role: 'system', content: system },
    ...historial,
    { role: 'user', content: mensaje },
  ];

  let respuestaFinal = '';
  const inicio = Date.now();

  while (true) {
    const response = await groq.chat.completions.create({
      model:       'llama-3.3-70b-versatile',
      max_tokens:  512,        // Limita tokens de salida → respuestas concisas y económicas
      temperature: 0.4,        // Más consistente, menos "creativo"
      messages:    mensajes,
      tools:       convertirTools(tools),
      tool_choice: 'auto',
    });

    const choice  = response.choices[0];
    const message = choice.message;

    // Limpieza agresiva de cualquier etiqueta <function...> o similar que el modelo intente inyectar en el texto
    if (message.content) {
      message.content = message.content.replace(/<function=.*?>.*?<\/function>/gi, '');
      message.content = message.content.replace(/<function=.*?>/gi, ''); // Por si no cerró la etiqueta
      message.content = message.content.trim();
    }

    if (choice.finish_reason === 'stop' || !message.tool_calls?.length) {
      respuestaFinal = message.content || '';
      mensajes.push({ role: 'assistant', content: respuestaFinal });
      break;
    }

    if (choice.finish_reason === 'tool_calls') {
      mensajes.push(message);

        for (const toolCall of message.tool_calls) {
          const nombre  = toolCall.function.name;
          const handler = TOOL_HANDLERS[nombre];
          let resultado;

          let args;
          try {
            args = JSON.parse(toolCall.function.arguments);
          } catch (err) {
            console.error(`[CHATBOT] Error parseando argumentos para tool ${nombre}:`, err.message);
            args = {};
          }
          console.log(`[CHATBOT] Ejecutando tool: ${nombre} con args:`, args);

          if (!handler) {
            resultado = { error: `Tool '${nombre}' no encontrada` };
          } else {
            try {
              resultado  = await handler(args);
            } catch (err) {
              console.error(`Error en tool ${nombre}:`, err.message);
              resultado = { error: `Error consultando Nexont: ${err.message}` };
            }
          }
          console.log(`[CHATBOT] Resultado tool RAW:`, resultado);
          console.log(`[CHATBOT] Resultado tool STRING:`, JSON.stringify(resultado, null, 2));
          // console.log(`[CHATBOT] Resultado tool: ${nombre}:`, resultado);

          mensajes.push({
            role:         'tool',
            tool_call_id: toolCall.id,
            content:      JSON.stringify(resultado),
          });
        
      }
    }
  }

  // Registrar interacción en la BD para analytics (no bloquea la respuesta)
  const tokensAprox = Math.ceil((system.length + mensaje.length + respuestaFinal.length) / 4);

  queries.registrarInteraccion({
    usuario_id: contexto.usuario_id || null,
    canal:      rol === 'comprador' ? 'CHATBOT' : 'ASISTENTE_VENTAS',
    consulta:   mensaje,
    respuesta:  respuestaFinal,
    tokens:     tokensAprox,
  });

  const historialActualizado = mensajes.slice(1);

  return {
    respuesta: respuestaFinal,
    mensajes:  historialActualizado,
  };
}

// Endpoint avanzado usando el sistema de prompts y queries
app.post('/chat', async (req, res) => {
  // Log de la URL y método de la petición
  console.log(`[CHATBOT] Petición recibida: ${req.method} ${req.originalUrl}`);
  console.log('[CHATBOT] Body recibido:', JSON.stringify(req.body, null, 2));
  const { rol = 'comprador', historial = [], mensaje, contexto = {} } = req.body;
  if (!mensaje) return res.status(400).json({ error: 'Message is required' });

  try {
    const result = await chat({ rol, historial, mensaje, contexto });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Chatbot service running on port ${PORT} (Groq, Prisma)`);
});
