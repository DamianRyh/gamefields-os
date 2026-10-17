"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export function GlbViewer({
  url,
  count = 1,
  pitch = 0,
  panelColor,
}: {
  url: string;
  count?: number;
  pitch?: number;
  panelColor?: string;
}) {
  const container = useRef<HTMLDivElement>(null),
    latestCount = useRef(count),
    latestColor = useRef(panelColor),
    controller = useRef<{
      rebuild: (count: number) => void;
      recolor: (color?: string) => void;
    } | null>(null);
  const [message, setMessage] = useState("Wczytywanie modelu GLB…");
  useEffect(() => {
    latestColor.current = panelColor;
    controller.current?.recolor(panelColor);
  }, [panelColor]);
  useEffect(() => {
    latestCount.current = count;
    controller.current?.rebuild(count);
  }, [count]);
  useEffect(() => {
    const host = container.current;
    if (!host) return;
    let disposed = false,
      frame = 0,
      renderer: THREE.WebGLRenderer | undefined,
      controls: OrbitControls | undefined,
      observer: ResizeObserver | undefined,
      template: THREE.Group | undefined;
    const release = (object: THREE.Object3D) => {
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>(),
        textures = new Set<THREE.Texture>();
      object.traverse((node) => {
        if (node instanceof THREE.Mesh) {
          geometries.add(node.geometry);
          for (const material of Array.isArray(node.material)
            ? node.material
            : [node.material]) {
            materials.add(material);
            Object.values(material).forEach((value) => {
              if (value instanceof THREE.Texture) textures.add(value);
            });
          }
        }
      });
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    };
    const start = requestAnimationFrame(() => {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.setClearColor("#e8e7df");
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene(),
          camera = new THREE.PerspectiveCamera(42, 1, 0.01, 500);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8d9385, 2.2));
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(5, 10, 6);
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xffffff, 1);
        fill.position.set(-6, 3, -4);
        scene.add(fill);
        const assembly = new THREE.Group();
        scene.add(assembly);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 0.2;
        controls.maxDistance = 150;
        observer = new ResizeObserver(() => {
          const width = Math.max(1, host.clientWidth),
            height = Math.max(1, host.clientHeight);
          renderer?.setSize(width, height, false);
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        });
        observer.observe(host);
        const draw = () => {
          if (disposed) return;
          controls?.update();
          renderer?.render(scene, camera);
          frame = requestAnimationFrame(draw);
        };
        draw();
        const rebuild = (quantity: number) => {
          if (!template || disposed) return;
          assembly.clear();
          for (let i = 0; i < quantity; i++) {
            const instance = template.clone(true);
            instance.name = `component-instance-${i}`;
            instance.position.x += i * pitch;
            assembly.add(instance);
          }
          const box = new THREE.Box3().setFromObject(assembly),
            size = box.getSize(new THREE.Vector3()),
            center = box.getCenter(new THREE.Vector3());
          const distance = Math.max(size.length() * 1.3, 0.25);
          camera.position
            .copy(center)
            .add(
              new THREE.Vector3(
                distance * 0.7,
                distance * 0.5,
                distance * 0.85,
              ),
            );
          camera.near = Math.max(0.001, distance / 10000);
          camera.far = Math.max(100, distance * 10);
          camera.updateProjectionMatrix();
          controls?.target.copy(center);
          controls?.update();
          host.dataset.loaded = "true";
          host.dataset.assetUrl = url;
          host.dataset.instanceCount = String(quantity);
          host.dataset.instanceScales = assembly.children
            .map((child) => child.scale.toArray().join(","))
            .join(";");
          let meshes = 0;
          assembly.traverse((node) => {
            if (node instanceof THREE.Mesh) meshes++;
          });
          host.dataset.meshCount = String(meshes);
        };
        const baseColors = new Map<THREE.MeshStandardMaterial, THREE.Color>();
        const recolor = (color?: string) => {
          template?.traverse((node) => {
            if (!(node instanceof THREE.Mesh)) return;
            for (const material of Array.isArray(node.material)
              ? node.material
              : [node.material]) {
              if (
                material instanceof THREE.MeshStandardMaterial &&
                material.name.startsWith("Panele - kolor edytowalny")
              ) {
                if (!baseColors.has(material))
                  baseColors.set(material, material.color.clone());
                material.color.copy(
                  color ? new THREE.Color(color) : baseColors.get(material)!,
                );
              }
            }
          });
          host.dataset.panelColor = color || "source";
        };
        controller.current = { rebuild, recolor };
        new GLTFLoader().load(
          url,
          (gltf) => {
            if (disposed) {
              release(gltf.scene);
              return;
            }
            template = gltf.scene;
            const box = new THREE.Box3().setFromObject(template),
              center = box.getCenter(new THREE.Vector3());
            template.position.sub(
              new THREE.Vector3(center.x, box.min.y, center.z),
            );
            recolor(latestColor.current);
            rebuild(latestCount.current);
            setMessage("");
          },
          undefined,
          () => {
            if (!disposed)
              setMessage(
                "Nie udało się wczytać GLB. Sprawdź połączenie i spróbuj ponownie.",
              );
          },
        );
      } catch {
        setMessage(
          "Podgląd wymaga przeglądarki z obsługą WebGL. Plik GLB można pobrać poniżej.",
        );
      }
    });
    return () => {
      disposed = true;
      cancelAnimationFrame(start);
      cancelAnimationFrame(frame);
      observer?.disconnect();
      controls?.dispose();
      if (template) release(template);
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      controller.current = null;
      delete host.dataset.loaded;
      delete host.dataset.assetUrl;
    };
  }, [url, pitch]);
  return (
    <div
      ref={container}
      className="gf-source-canvas"
      data-testid="source-glb-viewer"
      aria-label="Interaktywny podgląd modelu GLB"
    >
      {message ? <p role="status">{message}</p> : null}
    </div>
  );
}
