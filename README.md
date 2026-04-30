# BioMind

BioMind es una app web que ayuda a entender analisis medicos en PDF con explicaciones claras generadas por IA.

La idea es simple: muchas personas reciben resultados de laboratorio llenos de terminos tecnicos y valores dificiles de interpretar. BioMind transforma ese informe en un resumen entendible, marca valores normales o para revisar, y ofrece proximos pasos prudentes sin reemplazar la consulta medica.

## Demo

- Demo en vivo: https://franciscolarrosa96.github.io/BioMind/
- Demo automatica: https://franciscolarrosa96.github.io/BioMind/analysis?demo=true

Desde la landing tambien podes usar el boton **Probar con ejemplo** para ver resultados sin subir un archivo propio.

## Que problema resuelve

- Reduce la friccion de entender un PDF de laboratorio.
- Traduce lenguaje tecnico a explicaciones para pacientes.
- Resume el estado general del analisis: Normal, Revisar o Atencion.
- Ayuda a preparar mejores preguntas para la consulta medica.
- Refuerza que la herramienta es orientativa y no reemplaza a un profesional.

## Como funciona

1. El usuario sube un PDF de analisis medico.
2. BioMind envia el documento al backend configurado para procesarlo con Google Gemini.
3. La IA extrae datos del paciente, estudios, valores, rangos e interpretaciones.
4. La interfaz muestra un resumen general, estado del analisis, cards por estudio y recomendaciones.
5. El usuario puede pedir una explicacion mas simple por cada estudio con **Explicame mejor**.

Los documentos se procesan para generar el analisis y no se almacenan permanentemente desde el frontend.

## Screenshots

### Landing

![Landing de BioMind](src/assets/previa.avif)

### Flujo de analisis

La pantalla de resultados incluye:

- Aviso medico corto al inicio.
- Estado general del analisis.
- Headline contextual segun resultado.
- Resumen general.
- Cards por estudio con valor, rango, estado e interpretacion.
- Acciones sugeridas en "Que hacer ahora".
- Aviso medico completo al final.

## Stack tecnologico

- Angular 20
- TypeScript
- Angular Signals
- Tailwind CSS
- Google Gemini AI
- Backend REST para proxy seguro hacia Gemini

## Desarrollo local

```bash
npm install
npm start
```

Abrir:

```text
http://localhost:4200
```

Para probar la demo automatica:

```text
http://localhost:4200/analysis?demo=true
```

## Backend requerido

La app espera un endpoint:

```text
POST /ai/generate
```

Payload esperado desde el frontend:

```json
{
  "model": "gemini-2.5-flash-lite",
  "payload": {}
}
```

Configurar la URL del backend en:

```text
src/environments/environment.ts
src/environments/environment.prod.ts
```

## Aviso medico

BioMind brinda informacion educativa y orientativa generada con IA. No diagnostica, no indica medicacion y no reemplaza la consulta medica profesional.

Ante sintomas importantes, valores criticos o dudas sobre el informe, consultar con un profesional de salud.
