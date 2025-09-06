# BioMind 🧬

Una aplicación web inteligente que permite a los usuarios subir PDFs de análisis médicos y obtener explicaciones claras y comprensibles de cada valor utilizando IA.

## 🎯 Características

- **Análisis Inteligente**: Utiliza Gemini AI para analizar PDFs de estudios médicos
- **Explicaciones Simples**: Convierte terminología médica compleja en lenguaje comprensible
- **Interfaz Moderna**: Diseño responsivo con Tailwind CSS y tema médico
- **Modo Oscuro**: Soporte completo para tema claro y oscuro
- **Drag & Drop**: Interfaz intuitiva para subir archivos
- **Interpretación de Valores**: Clasifica cada resultado como Normal, Alto, Bajo o Crítico
- **Recomendaciones**: Proporciona consejos generales basados en los resultados

## 🚀 Tecnologías Utilizadas

- **Angular 19**: Framework principal
- **TypeScript**: Lenguaje de programación
- **Tailwind CSS**: Estilos y diseño responsivo
- **Gemini AI**: Análisis de documentos médicos
- **AOS**: Animaciones en scroll
- **Signals**: Gestión de estado reactiva

## 📋 Requisitos Previos

- Node.js (versión 18 o superior)
- npm o yarn
- Una API key de Google Gemini
- Un backend configurado para manejar las peticiones a Gemini

## 🛠️ Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd BioMind
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
Edita `src/environments/environment.ts` y `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: false,
  apiBase: 'http://localhost:3000' // Tu URL de backend
};
```

4. **Iniciar el servidor de desarrollo**
```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

## 🏗️ Configuración del Backend

La aplicación requiere un backend que maneje las peticiones a la API de Gemini. El endpoint esperado es:

```
POST /ai/generate
Content-Type: application/json

{
  "model": "gemini-2.5-flash-lite",
  "payload": {
    // Payload de Gemini con el PDF en base64
  }
}
```

## 📱 Uso

1. **Subir Análisis**: Arrastra y suelta un PDF de análisis médico o haz clic para seleccionarlo
2. **Procesar**: Haz clic en "Analizar con IA" y espera unos segundos
3. **Revisar Resultados**: 
   - Ve el resumen general de tu análisis
   - Revisa cada valor con explicaciones simples
   - Consulta las recomendaciones generales
4. **Vista Detallada**: Alterna entre vista simple y detallada para más información técnica

## 🎨 Características del Diseño

- **Responsive**: Funciona perfectamente en desktop, tablet y móvil
- **Tema Médico**: Colores y diseño inspirados en el ámbito de la salud
- **Animaciones Suaves**: Transiciones y animaciones con AOS
- **Accesibilidad**: Diseño inclusivo con buenas prácticas de UX/UI

## ⚠️ Aviso Médico Importante

**Esta aplicación es solo para fines educativos e informativos. NO reemplaza la consulta médica profesional. Siempre consulte a su médico para la interpretación correcta de sus análisis y decisiones sobre su salud.**

## 🔒 Seguridad y Privacidad

- Los PDFs se procesan temporalmente y no se almacenan
- La comunicación con la API se realiza de forma segura
- No se guardan datos personales o médicos

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ve el archivo `LICENSE` para más detalles.

## 🙏 Agradecimientos

- Google Gemini AI por el procesamiento de documentos
- Angular team por el excelente framework
- Tailwind CSS por el sistema de diseño
- La comunidad médica por inspirar esta herramienta

## 📞 Soporte

Si tienes preguntas o necesitas ayuda:
- Abre un issue en GitHub
- Consulta la documentación de Angular
- Revisa los logs de la consola para errores

---

**Desarrollado con ❤️ para hacer más accesible la información médica**
