export type ExportFormat = "copy" | "txt" | "markdown" | "json" | "print";

export interface PromptExportPayload {
  category: string;
  provider: string;
  mode: string;
  score: number | string;
  prompt: string;
  createdAt: string;
  grade?: string;
}

function formatDate(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year} - ${month} - ${day}`;
}

function createFileName(extension: string) {
  return `prompt - ${formatDate()}${extension}`;
}

function triggerDownload(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  window.URL.revokeObjectURL(url);
}

function buildMarkdown(payload: PromptExportPayload) {
  return [
    "# AI Prompt",
    "",
    "## Category",
    payload.category,
    "",
    "## AI Provider",
    payload.provider,
    "",
    "## Prompt Mode",
    payload.mode,
    "",
    "## Prompt Score",
    payload.grade ? `${payload.score} (${payload.grade})` : String(payload.score),
    "",
    "## Optimized Prompt",
    payload.prompt,
    "",
  ].join("\n");
}

function buildPrintMarkup(payload: PromptExportPayload) {
  const safePrompt = payload.prompt.replace(/</g, "&lt;").replace(/>/g, "&gt;");

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8" />
      <title>AI Prompt Export</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111827; margin: 24px; line-height: 1.6; }
        .meta { border-bottom: 1px solid #e5e7eb; padding-bottom: 12px; margin-bottom: 20px; }
        .label { font-weight: 700; color: #4b5563; }
        pre { white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px; }
        @media print { body { margin: 0; } }
      </style>
    </head>
    <body>
      <h1>AI Prompt</h1>
      <div class="meta">
        <p><span class="label">Category:</span> ${payload.category}</p>
        <p><span class="label">AI Provider:</span> ${payload.provider}</p>
        <p><span class="label">Prompt Mode:</span> ${payload.mode}</p>
        <p><span class="label">Prompt Score:</span> ${payload.score}</p>
        <p><span class="label">Created:</span> ${payload.createdAt}</p>
      </div>
      <h2>Optimized Prompt</h2>
      <pre>${safePrompt}</pre>
    </body>
  </html>`;
}

export async function exportPrompt(format: ExportFormat, payload: PromptExportPayload) {
  switch (format) {
    case "copy": {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(payload.prompt);
        return;
      }

      throw new Error("Clipboard access is unavailable in this browser.");
    }

    case "txt": {
      triggerDownload(createFileName(".txt"), payload.prompt, "text/plain;charset=utf-8");
      return;
    }

    case "markdown": {
      triggerDownload(
        createFileName(".md"),
        buildMarkdown(payload),
        "text/markdown;charset=utf-8",
      );
      return;
    }

    case "json": {
      const jsonPayload = {
        category: payload.category,
        provider: payload.provider,
        mode: payload.mode,
        score: payload.score,
        prompt: payload.prompt,
        createdAt: payload.createdAt,
      };

      triggerDownload(
        createFileName(".json"),
        JSON.stringify(jsonPayload, null, 2),
        "application/json;charset=utf-8",
      );
      return;
    }

    case "print": {
      if (typeof window === "undefined") return;

      const printWindow = window.open("", "_blank", "width=900,height=900");

      if (!printWindow) {
        throw new Error("Your browser blocked the print window.");
      }

      printWindow.document.write(buildPrintMarkup(payload));
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      return;
    }

    default:
      return;
  }
}
