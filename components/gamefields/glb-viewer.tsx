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
  surfaceColor,
  backgroundUrl,
}: {
  url: string;
  count?: number;
  pitch?: number;
  panelColor?: string;
  surfaceColor?: string;
  backgroundUrl?: string;
}) {
  const container = useRef<HTMLDivElement>(null),
    latestCount = useRef(count),
    latestColor = useRef(panelColor),
    latestSurface = useRef(surfaceColor),
    controller = useRef<{
      rebuild: (count: number) => void;
      recolor: (color?: string) => void;
      recolorSurface: (color?: string) => void;
    } | null>(null);
  const [backgroundError, setBackgroundError] = useState("");
  const [message, setMessage] = useState("Wczytywanie modelu GLB…");
  useEffect(() => {
    latestColor.current = panelColor;
    controller.current?.recolor(panelColor);
  }, [panelColor]);
  useEffect(() => {
    latestSurface.current = surfaceColor;
    controller.current?.recolorSurface(surfaceColor);
  }, [surfaceColor]);
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
      template: THREE.Group | undefined,
      backdrop: THREE.Texture | undefined,
      floor: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial> | undefined;
    let backgroundActive = false;
    setBackgroundError("");
    setMessage("Wczytywanie modelu GLB…");
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
        renderer.shadowMap.enabled = !!backgroundUrl;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.1;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene(),
          camera = new THREE.PerspectiveCamera(42, 1, 0.01, 500);
        scene.add(new THREE.HemisphereLight(0xffffff, 0x8d9385, 2.2));
        const sun = new THREE.DirectionalLight(0xffffff, 3);
        sun.position.set(5, 10, 6);
        sun.castShadow = !!backgroundUrl;
        sun.shadow.mapSize.set(1024, 1024);
        sun.shadow.bias = -0.0001;
        scene.add(sun);
        const fill = new THREE.DirectionalLight(0xffffff, 1);
        fill.position.set(-6, 3, -4);
        scene.add(fill);
        const assembly = new THREE.Group();
        scene.add(assembly);
        floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShadowMaterial({opacity:0.22}));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.visible = false;
        scene.add(floor);
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
          const target = center.clone();
          if (backgroundActive) target.y += size.length() * 0.10;
          camera.position
            .copy(target)
            .add(
              new THREE.Vector3(
                distance * 0.7,
                distance * (backgroundActive ? 0.77 : 0.5),
                distance * 0.85,
              ),
            );
          camera.near = Math.max(0.001, distance / 10000);
          camera.far = Math.max(100, distance * 10);
          camera.updateProjectionMatrix();
          controls!.enabled = !backgroundActive;
          controls?.target.copy(target);
          if (floor) {
            floor.visible = backgroundActive;
            floor.position.set(center.x, box.min.y - 0.003, center.z);
            floor.scale.setScalar(Math.max(size.x, size.z, 1) * 4);
          }
          const span = Math.max(size.x, size.z, 1) * 2;
          Object.assign(sun.shadow.camera, {left:-span,right:span,top:span,bottom:-span,far:200});
          sun.shadow.camera.updateProjectionMatrix();
          assembly.traverse(node=>{if(node instanceof THREE.Mesh)node.castShadow=backgroundActive});
          host.dataset.cameraMode = backgroundActive ? "fixed-scene" : "orbit";
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
        const recolorSurface = (color?: string) => {
          template?.traverse(node => {
            if (!(node instanceof THREE.Mesh)) return;
            for (const material of Array.isArray(node.material) ? node.material : [node.material]) {
              if (material instanceof THREE.MeshStandardMaterial && material.name === 'Nawierzchnia_baza') {
                if (!baseColors.has(material)) baseColors.set(material, material.color.clone());
                material.color.copy(color ? new THREE.Color(color) : baseColors.get(material)!);
              }
            }
          });
          host.dataset.surfaceColor = color || 'source';
        };
        controller.current = { rebuild, recolor, recolorSurface };
        if (backgroundUrl) {
          backdrop = new THREE.TextureLoader().load(backgroundUrl, texture=>{
            if(disposed){texture.dispose();return;}
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
            backgroundActive = true;
            renderer!.domElement.style.touchAction = "pan-y";
            host.dataset.backgroundReady = "true";
            rebuild(latestCount.current);
          }, undefined, ()=>{
            if(!disposed){host.dataset.backgroundReady="false";setBackgroundError("Tło jest niedostępne. Pokazujemy model na neutralnym tle.");}
          });
        }
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
            recolorSurface(latestSurface.current);
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
      backdrop?.dispose();
      floor?.geometry.dispose();
      floor?.material.dispose();
      renderer?.dispose();
      renderer?.forceContextLoss();
      renderer?.domElement.remove();
      controller.current = null;
      delete host.dataset.loaded;
      delete host.dataset.assetUrl;
      delete host.dataset.backgroundReady;
      delete host.dataset.cameraMode;
    };
  }, [url, pitch, backgroundUrl]);
  return (
    <div
      ref={container}
      className="gf-source-canvas"
      data-testid="source-glb-viewer"
      style={backgroundUrl ? {aspectRatio:"1672 / 941",height:"auto"} : undefined}
      aria-label={backgroundUrl ? "Model w scenerii — stałe ujęcie" : "Interaktywny podgląd modelu GLB"}
    >
      {message ? <p role="status">{message}</p> : null}
      {backgroundError ? <p role="status">{backgroundError}</p> : null}
    </div>
  );
}
