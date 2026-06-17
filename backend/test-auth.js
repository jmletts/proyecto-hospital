/**
 * Script de prueba para registrar un usuario, iniciar sesión y validar el token JWT.
 * El backend envuelve TODAS las respuestas en { success, data, meta } gracias al ResponseInterceptor.
 * Ejecutar con: node test-auth.js
 */

const BASE_URL = 'http://localhost:5000';

// Helper para extraer el payload real de la respuesta envuelta por el interceptor
function unwrap(responseData) {
  if (responseData && typeof responseData === 'object' && 'data' in responseData) {
    return responseData.data;
  }
  return responseData;
}

async function runTest() {
  console.log('=== Iniciando pruebas de autenticación ===\n');

  // Generamos un correo único para evitar conflictos si se ejecuta varias veces
  const uniqueId = Math.floor(Math.random() * 100000);
  const testUser = {
    correo: `testuser_${uniqueId}@nawi.com`,
    password: 'password123',
  };

  // ─── PASO 1: REGISTRO ──────────────────────────────────────────────────────
  console.log(`[1/3] Registrando nuevo usuario: ${testUser.correo} ...`);
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const raw = await res.json();
    const data = unwrap(raw);

    if (!res.ok) {
      throw new Error(JSON.stringify(raw));
    }

    console.log('✅ Registro exitoso.');
    console.log('   → Usuario creado:', data);
  } catch (error) {
    console.error('❌ Error en Registro:', error.message);
    return;
  }

  // ─── PASO 2: LOGIN ─────────────────────────────────────────────────────────
  console.log(`\n[2/3] Iniciando sesión con: ${testUser.correo} ...`);
  let token = null;
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser),
    });

    const raw = await res.json();
    // El interceptor envuelve la respuesta: { success, data: { access_token, user }, meta }
    const payload = unwrap(raw);

    if (!res.ok) {
      throw new Error(JSON.stringify(raw));
    }

    token = payload?.access_token;

    if (!token) {
      throw new Error(`No se recibió access_token. Respuesta completa: ${JSON.stringify(raw)}`);
    }

    console.log('✅ Inicio de sesión exitoso.');
    console.log(`   → Token JWT: ${token.substring(0, 30)}...`);
    console.log('   → Usuario:', payload.user);
  } catch (error) {
    console.error('❌ Error en Login:', error.message);
    return;
  }

  // ─── PASO 3: ENDPOINT PROTEGIDO /auth/me ──────────────────────────────────
  console.log('\n[3/3] Validando token en endpoint protegido (/auth/me) ...');
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });

    const raw = await res.json();
    const profile = unwrap(raw);

    if (!res.ok) {
      throw new Error(JSON.stringify(raw));
    }

    console.log('✅ Token válido. Perfil del usuario autenticado:');
    console.log('   →', profile);
    console.log('\n🎉 ¡Todas las pruebas pasaron con éxito!');
  } catch (error) {
    console.error('❌ Error en /auth/me:', error.message);
  }
}

runTest();
