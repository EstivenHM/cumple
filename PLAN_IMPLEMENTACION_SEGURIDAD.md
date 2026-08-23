# Plan de implementacion: acceso mediante codigo de fecha

## 1. Decision tecnica

El sitio actual se publica como archivos estaticos en GitHub Pages. En ese modelo:

- Un archivo `.env` dentro del repositorio o publicado por el sitio no es secreto.
- Todo valor usado por JavaScript llega al navegador y puede inspeccionarse o modificarse.
- Ocultar la vista inicial o redirigir desde `index.html` no impide abrir directamente `heart.html`, `Eventos.html` u otra pagina.

Por eso, las restricciones de mantener el codigo oculto y evitar saltarse la verificacion **no se pueden cumplir con HTML, CSS, JavaScript y GitHub Pages unicamente**. No se creara un `.env` en este repositorio mientras siga siendo un sitio estatico.

## 2. Arquitectura recomendada

Migrar el punto de entrada y las paginas privadas a un hosting con funciones de servidor, por ejemplo Cloudflare Pages Functions, Vercel Functions o un servidor Node. El repositorio puede conservar los archivos actuales durante la migracion.

1. Crear `.env.example` con la forma del secreto, sin el valor real:

   ```text
   ACCESS_DATE=YYYY-MM-DD
   SESSION_SECRET=replace-in-deployment-secrets
   ```

2. Crear `.gitignore` con `.env` y `.env.*`, permitiendo unicamente `.env.example`.
3. Guardar `ACCESS_DATE` y `SESSION_SECRET` en los secretos del proveedor de despliegue, nunca en GitHub.
4. Mover el contenido privado a rutas servidas por el backend. El HTML privado no debe formar parte del bundle publico.
5. Mantener `index.html` como vista de acceso: formulario de fecha, estado de error accesible y sin incluir el contenido privado ni el valor esperado.
6. Enviar la fecha al endpoint `POST /auth/verify` sobre HTTPS.
7. En el servidor, normalizar estrictamente la entrada a `YYYY-MM-DD`, compararla con `ACCESS_DATE`, aplicar limite de intentos y crear una sesion opaca en cookie `HttpOnly; Secure; SameSite=Strict`.
8. Proteger con middleware todas las rutas HTML privadas, incluidas las que hoy se pueden abrir directamente. Sin cookie valida deben responder `401` o redirigir a la vista de acceso.
9. No aceptar un indicador de autenticacion proveniente de `localStorage`, `sessionStorage`, query strings o variables editables del cliente.
10. Mantener los enlaces actuales y verificar uno por uno que sigan funcionando despues de la proteccion.

### Limite del requisito de fecha

Una fecha tiene poca entropia y puede adivinarse si el atacante conoce el rango probable. El servidor debe incluir rate limiting, mensajes de error uniformes y registro de intentos fallidos. Si se necesita seguridad real, el codigo deberia ser un secreto aleatorio adicional; si la fecha es obligatoria, se acepta que protege principalmente contra acceso casual.

## 3. Secuencia de implementacion

### Fase A: preparacion sin cambiar el sitio

- Registrar una copia o rama de trabajo.
- Añadir `.gitignore` y `.env.example` sin secretos.
- Elegir el proveedor con funciones de servidor y configurar HTTPS.
- Definir las rutas publicas y privadas. Todo el contenido de `index.html` que deba quedar protegido se considera privado.

### Fase B: autenticacion

- Implementar un modulo puro `normalizeAccessDate(value)`.
- Implementar `verifyAccessDate(value, expectedDate)` en servidor, usando comparacion de longitud fija y sin devolver el valor esperado.
- Implementar sesiones firmadas u opacas con expiracion.
- Implementar middleware de proteccion y limite de intentos por IP/sesion.

### Fase C: integracion conservadora

- Reutilizar el contenido visual actual y añadir solo la vista de codigo en la entrada.
- Cambiar los enlaces para pasar por rutas protegidas del servidor.
- Confirmar que no queden copias publicas de las paginas privadas en el repositorio servido por GitHub Pages.
- Publicar primero en un entorno de prueba y despues cambiar el dominio o el flujo de produccion.

## 4. Pruebas unitarias

Usar Vitest o el runner equivalente del backend. Como minimo:

- Fecha valida en formato `YYYY-MM-DD`.
- Fechas invalidas, fechas inexistentes y formatos alternativos rechazados.
- Codigo correcto concede acceso.
- Codigo incorrecto no concede acceso y no filtra informacion por el mensaje o el tiempo de respuesta.
- Falta de cookie, cookie alterada y cookie expirada bloquean una ruta privada.
- El limite de intentos bloquea nuevos intentos durante la ventana configurada.
- Las rutas publicas siguen respondiendo y los enlaces existentes no se rompen.

## 5. Metricas de calidad

- Cobertura del modulo de autenticacion: `>= 90%` en lineas y ramas.
- Pruebas unitarias: `100%` verdes en CI.
- Vulnerabilidades de severidad alta o critica: `0` en la auditoria de dependencias.
- Secretos detectados en el repositorio: `0`.
- Rutas privadas accesibles sin sesion: `0`.
- Intentos fallidos registrados sin revelar el codigo esperado: `100%` de los eventos.
- Tiempo de respuesta del endpoint de verificacion en el percentil 95: `< 500 ms` en el entorno de prueba.

## 6. Unica prueba de QA

Ejecutar un unico caso end-to-end en una ventana privada del navegador:

1. Abrir la URL de inicio sin cookies: debe mostrarse solo el formulario de fecha.
2. Introducir una fecha incorrecta: debe rechazarse sin mostrar contenido privado.
3. Introducir la fecha correcta: debe abrirse el contenido y quedar una cookie de sesion `HttpOnly`, `Secure` y `SameSite=Strict`.
4. Recargar y abrir directamente una ruta privada: debe permitirse mientras la sesion sea valida.
5. Eliminar la cookie y abrir de nuevo esa ruta privada: debe bloquearse y volver a la vista de acceso.

Resultado esperado: no es posible ver el contenido privado sin completar la verificacion en el servidor, y el flujo actual sigue navegable tras autenticarse.

## Criterio de aceptacion

No considerar terminada la implementacion si el contenido privado sigue desplegado como HTML accesible directamente desde GitHub Pages. En ese caso solo existiria una barrera visual, no una proteccion de acceso.