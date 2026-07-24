import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";

const router = Router();

const docsDir = path.resolve(process.cwd(), "docs");

/**
 * GET /api/v1/docs/openapi.json
 * Returns raw OpenAPI 3.1 JSON spec
 */
router.get("/openapi.json", (_req: Request, res: Response) => {
  const jsonPath = path.join(docsDir, "openapi.json");
  if (fs.existsSync(jsonPath)) {
    res.setHeader("Content-Type", "application/json");
    return res.sendFile(jsonPath);
  }
  return res.status(404).json({ success: false, message: "OpenAPI JSON spec not found." });
});

/**
 * GET /api/v1/docs/openapi.yaml
 * Returns raw OpenAPI 3.1 YAML spec
 */
router.get("/openapi.yaml", (_req: Request, res: Response) => {
  const yamlPath = path.join(docsDir, "openapi.yaml");
  if (fs.existsSync(yamlPath)) {
    res.setHeader("Content-Type", "text/yaml");
    return res.sendFile(yamlPath);
  }
  return res.status(404).json({ success: false, message: "OpenAPI YAML spec not found." });
});

/**
 * GET /api/docs
 * Serves standalone interactive Swagger UI page
 */
export const swaggerUiHtmlHandler = (_req: Request, res: Response) => {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RentNest API Documentation & Swagger UI</title>
  <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui.min.css" />
  <link rel="icon" type="image/png" href="https://swagger.io/favicon-32x32.png" sizes="32x32" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin:0; background: #0f172a; color: #f8fafc; font-family: sans-serif; }
    .topbar { display: none; }
    .swagger-ui { background: #0f172a; filter: invert(88%) hue-rotate(180deg); }
    .swagger-ui .info { margin: 20px 0; }
    .swagger-ui .info .title { color: #0284c7; }
    .header-banner { background: linear-gradient(135deg, #1e293b, #0f172a); border-bottom: 1px solid #334155; padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; }
    .header-banner h1 { margin: 0; font-size: 24px; color: #38bdf8; }
    .header-banner p { margin: 4px 0 0 0; color: #94a3b8; font-size: 14px; }
    .btn-links a { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 600; margin-left: 10px; font-size: 13px; }
    .btn-links a:hover { background: #0369a1; }
  </style>
</head>
<body>
  <div class="header-banner">
    <div>
      <h1>RentNest SaaS Platform API Reference</h1>
      <p>Production OpenAPI 3.1.0 Specification & Interactive API Sandbox</p>
    </div>
    <div class="btn-links">
      <a href="/api/v1/docs/openapi.json" target="_blank">Download OpenAPI JSON</a>
      <a href="/api/v1/docs/openapi.yaml" target="_blank">Download OpenAPI YAML</a>
    </div>
  </div>
  <div id="swagger-ui"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-bundle.js" charset="UTF-8"> </script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.11.0/swagger-ui-standalone-preset.js" charset="UTF-8"> </script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "/api/v1/docs/openapi.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout"
      });
      window.ui = ui;
    };
  </script>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html");
  return res.send(htmlContent);
};

export default router;
