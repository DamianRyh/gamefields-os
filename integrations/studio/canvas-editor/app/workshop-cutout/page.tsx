"use client";

import { useEffect, useRef, useState } from "react";
import { PannaStudioPreview } from "@/components/blender-arena-preview";
import { projectSchema, type Project } from "@/lib/project";
import "./cutout.css";

/**
 * Read-only transparent render for a previously published Workshop project.
 * It does not alter Studio recovery, persistence or any source configuration.
 * Explicitly does not calibrate camera pose against a photograph.
 */
export default function WorkshopCutout() {
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const sent = useRef(false);
  const idRef = useRef("");
  const targetOrigin = useRef("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id") || "";
    const parent = params.get("parentOrigin") || "";
    if (!/^[0-9a-f-]{36}$/i.test(id)) { setError("Niepoprawny identyfikator publicznego projektu."); return; }
    if (![location.origin, "https://www.gamefields.eu", "https://gamefields.eu"].includes(parent)) {
      setError("Nieautoryzowany odbiorca podglądu."); return;
    }
    idRef.current = id;
    targetOrigin.current = parent;
    const controller = new AbortController();
    fetch("/api/workshop?id=" + encodeURIComponent(id), { signal: controller.signal, cache: "no-store" })
      .then(response => { if (!response.ok) throw Error("Projekt niedostępny."); return response.json(); })
      .then(data => setProject(projectSchema.parse(data.project)))
      .catch(error => { if (!controller.signal.aborted) setError((error as Error).message); });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!error || !targetOrigin.current || !idRef.current) return;
    window.parent.postMessage({
      type: "gf-workshop-cutout-error",
      id: idRef.current,
      error: "Podgląd 3D jest niedostępny. Sprawdź projekt i spróbuj ponownie.",
    }, targetOrigin.current);
  }, [error]);

  useEffect(() => {
    if (!project || !root.current) return;
    let frame = 0;
    const capture = () => {
      const stage = root.current?.querySelector<HTMLElement>(".panna-studio-model");
      if (!stage || sent.current || stage.dataset.ready !== "true" ||
          stage.dataset.renderComplete !== stage.dataset.renderRequest ||
          Number(stage.dataset.renderComplete) < 1) return;
      const source = stage.querySelector("canvas");
      if (!source || !source.width || !source.height) return;
      try {
        const width = 960, height = 540;
        const output = document.createElement("canvas");
        output.width = width; output.height = height;
        const ctx = output.getContext("2d");
        if (!ctx) throw Error("Canvas unavailable");
        // No white background: the existing WebGL renderer clears to RGBA(0,0,0,0).
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(source, 0, 0, width, height);
        const pixels = ctx.getImageData(0, 0, width, height).data;
        let opaque = 0, minX = width, minY = height, maxX = -1, maxY = -1;
        for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
          const alpha = pixels[(y * width + x) * 4 + 3];
          if (alpha > 20) {
            opaque++; minX = Math.min(minX, x); maxX = Math.max(maxX, x);
            minY = Math.min(minY, y); maxY = Math.max(maxY, y);
          }
        }
        if (opaque < 200 || minX >= maxX || minY >= maxY) throw Error("Model 3D nie został poprawnie wyrenderowany.");
        const padding = 12;
        const x0 = Math.max(0, minX - padding), y0 = Math.max(0, minY - padding);
        const cropW = Math.min(width - x0, maxX - x0 + padding + 1);
        const cropH = Math.min(height - y0, maxY - y0 + padding + 1);
        const crop = document.createElement("canvas");
        crop.width = cropW; crop.height = cropH;
        crop.getContext("2d")?.drawImage(output, x0, y0, cropW, cropH, 0, 0, cropW, cropH);
        const png = crop.toDataURL("image/png");
        if (png.length > 2_800_000) throw Error("Obraz przekracza limit 2 MB.");
        sent.current = true;
        window.parent.postMessage({
          type: "gf-workshop-cutout",
          id: idRef.current,
          image: png,
          width: cropW,
          height: cropH,
          mode: "uncalibrated-3d-concept",
        }, targetOrigin.current);
      } catch (error) {
        setError((error as Error).message);
      }
    };
    const schedule = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => requestAnimationFrame(capture)); };
    const observer = new MutationObserver(schedule);
    observer.observe(root.current, { attributes: true, subtree: true, attributeFilter: ["data-ready", "data-render-request", "data-render-complete"] });
    schedule();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [project]);

  return <main className="gf-cutout-page" aria-label="Transparentny podgląd zapisanej konstrukcji">
    <div className="gf-cutout-stage" ref={root}>
      {project ? <PannaStudioPreview project={project} studio /> : <p role="status">{error || "Renderujemy konstrukcję…"}</p>}
      {project && error ? <p className="gf-cutout-error" role="alert">{error}</p> : null}
    </div>
  </main>;
}
