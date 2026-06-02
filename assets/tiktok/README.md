# ALLPA · Navegador de 100 videos para TikTok

Página estática para GitHub Pages orientada a posicionar a Stiven Morales como referente de la pequeña avicultura colombiana.

## Estructura

```text
allpa-video-strategy-github/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/app.js
├── data/
│   ├── categorias.json
│   ├── ideas-videos.json
│   ├── metricas-videos.json
│   └── aprendizajes.json
└── README.md
```

## Cómo usar en GitHub

1. Crear un repositorio en GitHub, por ejemplo: `allpa-video-strategy`.
2. Subir todos los archivos de esta carpeta.
3. Entrar a **Settings → Pages**.
4. En **Build and deployment**, seleccionar:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guardar. GitHub publicará la página.

## Cómo alimentar la estrategia

### Categorías
Editar `data/categorias.json` para agregar:
- Dream Outcomes.
- Productos Allpa.
- Capítulos de historia.
- Principios de persuasión.
- Estados.
- Formatos.

### Ideas de video
Editar `data/ideas-videos.json`.

Cada video debe tener:
- `dream_outcome_id`
- `historia_id`
- `persuasion_id`
- `producto_id`
- `estado`
- `guion`
- `relacionados`

### Métricas
Editar `data/metricas-videos.json` después de publicar cada video.

Campos clave:
- `url_tiktok`
- `vistas`
- `retencion_porcentaje`
- `likes`
- `comentarios`
- `guardados`
- `compartidos`
- `leads_whatsapp`
- `senal_venta`

## Importante

La página permite cambios locales usando `localStorage`. Para conservarlos:
1. Usar el botón **Exportar datos**.
2. Guardar el JSON.
3. Luego copiar los cambios importantes en los archivos `data/*.json` del repositorio.

## Próxima mejora recomendada

Conectar la página a Google Sheets o usar GitHub Issues/Actions para subir métricas sin editar JSON manualmente.
