# BioMind 🧬

<div align="center">

![BioMind Logo](https://img.shields.io/badge/BioMind-Medical%20AI%20Analysis-blue?style=for-the-badge&logo=dna&logoColor=white)

**Una aplicación web inteligente que democratiza el acceso a la información médica**

[![Angular](https://img.shields.io/badge/Angular-20-red?style=flat-square&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.0-cyan?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/Gemini%20AI-Powered-orange?style=flat-square&logo=google)](https://ai.google.dev/)

[🚀 Demo en vivo](#) | [📖 Documentación](#) | [🐛 Reportar Bug](https://github.com/FranciscoLarrosa96/BioMind/issues)

</div>

---

## ✨ ¿Qué es BioMind?

BioMind transforma la manera en que las personas entienden sus análisis médicos. Utilizando inteligencia artificial avanzada de Google Gemini, convierte PDFs de estudios de laboratorio en explicaciones claras y comprensibles para cualquier persona.

### 🎯 **Problema que resuelve**
- ❌ Terminología médica compleja e incomprensible
- ❌ Ansiedad por no entender los resultados
- ❌ Largos tiempos de espera para consultas médicas
- ❌ Falta de contexto sobre qué significan los valores

### ✅ **Nuestra solución**
- ✨ Explicaciones simples y en español
- 🎨 Interfaz intuitiva y moderna
- ⚡ Análisis instantáneo con IA
- 🔒 Procesamiento seguro y privado

---

## � Características Principales

<table>
<tr>
<td width="50%">

### 🤖 **Análisis Inteligente**
- Powered by Google Gemini AI
- Reconocimiento automático de valores
- Clasificación inteligente (Normal/Alto/Bajo/Crítico)
- Soporte para múltiples tipos de análisis

</td>
<td width="50%">

### 🎨 **Experiencia de Usuario**
- Diseño responsive y moderno
- Modo oscuro/claro
- Drag & drop para archivos
- Animaciones suaves y elegantes

</td>
</tr>
<tr>
<td width="50%">

### 📊 **Interpretación Completa**
- Resumen general del análisis
- Explicaciones técnicas y simplificadas
- Recomendaciones generales
- Indicadores visuales de estado

</td>
<td width="50%">

### 🔐 **Seguridad y Privacidad**
- Procesamiento temporal de archivos
- Sin almacenamiento de datos personales
- Comunicación encriptada
- Cumplimiento de buenas prácticas

</td>
</tr>
</table>

---

## 🚀 Stack Tecnológico

<div align="center">

| Frontend | AI/Backend | Styling | Tooling |
|----------|------------|---------|---------|
| ![Angular](https://img.shields.io/badge/Angular-19-DD0031?style=for-the-badge&logo=angular&logoColor=white) | ![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=for-the-badge&logo=google&logoColor=white) | ![Tailwind](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) |
| ![Signals](https://img.shields.io/badge/Angular%20Signals-Reactive-red?style=for-the-badge) | ![API REST](https://img.shields.io/badge/REST%20API-Backend-green?style=for-the-badge) | ![AOS](https://img.shields.io/badge/AOS-Animations-purple?style=for-the-badge) | ![NPM](https://img.shields.io/badge/NPM-CB3837?style=for-the-badge&logo=npm&logoColor=white) |

</div>

---

## �️ Instalación y Configuración

### Requisitos Previos
- **Node.js** >= 18.x
- **npm** o **yarn**
- **API Key de Google Gemini**
- **Backend configurado** (ver [configuración](#backend))

### Instalación Rápida

```bash
# 1. Clonar el repositorio
git clone https://github.com/FranciscoLarrosa96/BioMind.git
cd BioMind

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
# Editar src/environments/environment.ts
# y src/environments/environment.prod.ts

# 4. Iniciar servidor de desarrollo
npm start

# 5. Abrir navegador en http://localhost:4200
```

### <a name="backend"></a>🏗️ Configuración del Backend

La aplicación requiere un backend que maneje las peticiones a Gemini AI:

```javascript
// Endpoint requerido: POST /ai/generate
{
  "model": "gemini-2.5-flash-lite",
  "payload": {
    // Payload de Gemini con el PDF en base64
  }
}
```

**Variables de entorno necesarias:**

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiBase: 'http://localhost:3000' // URL de tu backend
};
```

---

## 📱 Guía de Uso

### 1. **Subir Análisis**
- Arrastra y suelta tu PDF de análisis médico
- O haz clic para seleccionar desde tu dispositivo
- Formatos soportados: PDF

### 2. **Procesamiento IA**
- Haz clic en "Analizar con IA"
- Espera mientras Gemini procesa tu documento
- El análisis toma entre 10-30 segundos

### 3. **Revisar Resultados**
- **Resumen General**: Vista panorámica de tu análisis
- **Valores Detallados**: Cada parámetro con explicación
- **Recomendaciones**: Consejos generales de salud
- **Vista Técnica**: Información detallada para profesionales

---

## 🎨 Capturas de Pantalla

<div align="center">

### 📤 Interfaz de Carga
*Interfaz intuitiva con drag & drop para subir archivos PDF*

### 📊 Resultados del Análisis
*Vista detallada de resultados con explicaciones simples*

### 🌙 Modo Oscuro
*Soporte completo para tema claro y oscuro*

</div>

---

## ⚠️ Aviso Médico Importante

<div align="center">
<strong>🩺 Esta aplicación es solo para fines educativos e informativos</strong><br>
<em>NO reemplaza la consulta médica profesional</em><br><br>
Siempre consulte a su médico para la interpretación correcta de sus análisis y decisiones sobre su salud.
</div>

---

## 🔒 Seguridad y Privacidad

- ✅ **Procesamiento temporal**: Los PDFs se procesan temporalmente y no se almacenan
- ✅ **Comunicación segura**: Todas las comunicaciones con la API son encriptadas
- ✅ **Sin datos personales**: No guardamos información médica o personal
- ✅ **Cumplimiento normativo**: Seguimos las mejores prácticas de privacidad

---

## 🤝 Contribuir al Proyecto

¡Nos encanta recibir contribuciones! Sigue estos pasos:

1. **Fork** el proyecto
2. **Crea** una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add: Amazing new feature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre** un Pull Request

### � Reportar Issues
- Usa las [plantillas de issues](https://github.com/FranciscoLarrosa96/BioMind/issues/new/choose)
- Incluye información detallada del problema
- Adjunta capturas de pantalla si es posible

### 💡 Ideas y Sugerencias
- Abre un [Issue de tipo Feature Request](https://github.com/FranciscoLarrosa96/BioMind/issues/new?template=feature_request.md)
- Describe claramente la funcionalidad propuesta
- Explica cómo beneficiaría a los usuarios

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

<div align="center">

**Un especial agradecimiento a:**

🤖 **Google Gemini AI** - Por la tecnología de procesamiento de documentos<br>
🅰️ **Angular Team** - Por el increíble framework<br>
🎨 **Tailwind CSS** - Por el sistema de diseño<br>
👥 **Comunidad Médica** - Por inspirar esta herramienta<br>
💡 **Contribuidores** - Por hacer BioMind mejor cada día

</div>

---

## 📞 Soporte y Contacto

<div align="center">

¿Necesitas ayuda? ¡Estamos aquí para ti!

[![GitHub Issues](https://img.shields.io/badge/GitHub-Issues-black?style=for-the-badge&logo=github)](https://github.com/FranciscoLarrosa96/BioMind/issues)
[![Documentation](https://img.shields.io/badge/Docs-Angular-red?style=for-the-badge&logo=angular)](https://angular.dev)
[![Stack Overflow](https://img.shields.io/badge/Stack%20Overflow-Questions-orange?style=for-the-badge&logo=stackoverflow)](https://stackoverflow.com/questions/tagged/angular)

**¿Tienes preguntas específicas?**
- 📋 Revisa la [documentación del proyecto](#)
- 🔍 Busca en [issues existentes](https://github.com/FranciscoLarrosa96/BioMind/issues)
- 💬 Abre un [nuevo issue](https://github.com/FranciscoLarrosa96/BioMind/issues/new)

</div>

---

<div align="center">

**Desarrollado con ❤️ para hacer más accesible la información médica**

⭐ **¡Si te gusta BioMind, danos una estrella!** ⭐

[⬆️ Volver arriba](#biomind-)

</div>
