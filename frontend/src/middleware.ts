import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware((context, next) => {
  const token = context.cookies.get('token')?.value;
  const url = new URL(context.request.url);

  // Redirigir a inicio (/) a /login
  if (url.pathname === '/') {
    if (token) {
      return context.redirect('/dashboard');
    } else {
      return context.redirect('/login');
    }
  }

  // Si intenta acceder a páginas protegidas sin token
  if (url.pathname.startsWith('/dashboard')) {
    if (!token) {
      return context.redirect('/login');
    }
  }

  // Si ya tiene sesión activa e intenta ir a login/registro
  if (url.pathname === '/login' || url.pathname === '/register') {
    if (token) {
      return context.redirect('/dashboard');
    }
  }

  return next();
});
