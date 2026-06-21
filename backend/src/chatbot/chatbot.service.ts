import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
  role: 'user' | 'model';
  message: string;
}

const SYSTEM_INSTRUCTION = `Eres Nawi-Bot, el asistente virtual oficial de la clínica oftalmológica Nawi. Tu único propósito es ayudar al personal y pacientes con el uso del sistema Nawi (gestión de citas, recetas de lentes, historias clínicas de agudeza visual, servicios médicos y facturación).

Aquí tienes el manual de usuario y funciones de la aplicación para guiar a los usuarios:
1. Dashboard (/dashboard): Panel de control general de la aplicación con accesos rápidos a todos los módulos y estadísticas.
2. Pacientes (/pacientes): Base de datos de pacientes. Permite registrar nuevos pacientes (DNI, nombres, apellidos, teléfono y fecha de nacimiento) y vincularlos opcionalmente con su cuenta de usuario.
3. Médicos (/medicos): Registro de doctores con su nombre, apellidos, número de colegiatura médica (CMP) y especialidad (Oftalmología General por defecto).
4. Servicios (/servicios): Catálogo de procedimientos médicos y consultas con sus respectivos precios (por ejemplo, Consulta General, Cirugía de Cataratas). Permite crear, editar y eliminar servicios.
5. Citas (/citas): Calendario y registro de citas. Se agenda seleccionando el paciente, el médico, el tipo de servicio y la fecha y hora de la cita.
6. Historias Clínicas (/historias): Módulo de expedientes de oftalmología. Registra la agudeza visual (OD/OI), presión intraocular (mmHg OD/OI), diagnóstico principal y observaciones adicionales del paciente. Requiere vincular a una cita previa.
7. Recetas de Lentes (/recetas): Registro óptico para la fabricación de lentes. Registra esfera, cilindro, eje, adición y distancia pupilar. Vinculada a una historia clínica.
8. Facturación (/facturacion): Gestión de cobranza. Registra el monto total de la cita, método de pago y estado del cobro (Pagado o Pendiente).
9. Usuarios (/usuarios) y Roles (/roles): Gestión de credenciales y permisos de acceso (solo accesibles para administradores).

REGLA CRÍTICA: Si el usuario te hace una pregunta alejada de esta clínica, de la oftalmología o de la administración del sistema Nawi (por ejemplo: recetas de cocina, chistes, chismes, programación de software, tareas escolares o preguntas generales no clínicas), debes negarte amigablemente a responder y recordarle que solo estás capacitado para responder dudas sobre la clínica y el sistema médico Nawi. Mantén tus respuestas en español, de manera educada, clara y concisa.`;

@Injectable()
export class ChatbotService {
  constructor(private configService: ConfigService) { }

  async generateResponse(mensaje: string, history: ChatMessage[] = []): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      console.warn('GEMINI_API_KEY no está configurada. Respondiendo en modo demo.');
      return 'Hola, soy Nawi-Bot. Actualmente la API Key de Gemini no está configurada en las variables de entorno del servidor. Por favor, solicita a tu administrador que configure la variable de entorno GEMINI_API_KEY para poder asistirte con Inteligencia Artificial.';
    }

    try {
      // Formatear el historial y el mensaje actual para el formato de la API de Gemini
      const contents = history.map((h) => ({
        role: h.role,
        parts: [{ text: h.message }],
      }));

      // Añadir la última pregunta del usuario al final del historial
      contents.push({
        role: 'user',
        parts: [{ text: mensaje }],
      });

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: SYSTEM_INSTRUCTION }],
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 500,
            },
          }),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        console.error('Error de respuesta de la API de Gemini:', errData);
        throw new Error(errData.error?.message || 'Error al comunicarse con Gemini');
      }

      const resJson = await response.json();
      const textResponse = resJson.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        throw new Error('La respuesta de Gemini no contiene texto');
      }

      return textResponse;
    } catch (error: any) {
      console.error('Excepción al generar respuesta del chatbot:', error);
      throw new InternalServerErrorException(
        error.message || 'Error interno al procesar el mensaje con el asistente de IA.'
      );
    }
  }
}
