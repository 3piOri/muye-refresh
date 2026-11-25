MUYË — actualización visual premium

Archivos incluidos:
- index.html: estructura editorial renovada; conserva los enlaces de Instagram y WhatsApp y los IDs que usa el catálogo.
- style.css: nueva dirección visual responsive y animaciones sutiles.
- script.js: lógica original de menú, catálogo y Supabase, sin cambios.
- services-data.js: datos locales originales de productos, sin cambios.
- admin.html / admin.css / admin.js: panel de administración original, sin cambios.

Instalación:
1. Haz una copia de seguridad de tu sitio actual.
2. Sustituye index.html y style.css por los de esta carpeta.
3. Conserva script.js, services-data.js, supabase-config.js y todos los recursos gráficos actuales.
4. No reemplaces tu carpeta de imágenes: el diseño sigue utilizando 1.png y las imágenes indicadas en services-data.js.
5. El panel /admin y su funcionamiento no necesitan cambios.

Nota: los archivos de configuración de Supabase no se incluyen en este paquete para evitar duplicar credenciales o configuración privada. Mantén tu supabase-config.js actual.

Para compilar: ./compilar.ps1
Si marca error: Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
./compilar.ps1