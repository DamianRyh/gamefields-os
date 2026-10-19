"use client";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createPlayingSurface, finishProduct } from "./product-presentation";

export function GlbViewer({
  url,
  count = 1,
  pitch = 0,
  panelColor,
  backgroundUrl,
}: {
  url: string;
  count?: number;
  pitch?: number;
  panelColor?: string;
  backgroundUrl?: string;
}) {
  const container = useRef<HTMLDivElement>(null),
    latestCount = useRef(count),
    latestColor = useRef(panelColor),
    controller = useRef<{
      rebuild: (count: number) => void;
      recolor: (color?: string) => void;
    } | null>(null);
  const [backgroundError, setBackgroundError] = useState("");
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
      template: THREE.Group | undefined,
      backdrop: THREE.Texture | undefined,
      floor: THREE.Mesh<THREE.PlaneGeometry, THREE.ShadowMaterial | THREE.MeshStandardMaterial> | undefined,
      surface: ReturnType<typeof createPlayingSurface>,
      environment: THREE.WebGLRenderTarget | undefined;
    const fullCourt = /(?:boisko-p1|boisko-w1|panna-kids(?:-o1)?)\.glb(?:\?|$)/.test(url);
    let backgroundActive = false;
    let needsRender = true;
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
        renderer.setClearColor("#e9e7e1");
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.shadowMap.autoUpdate = false;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 0.92;
        host.appendChild(renderer.domElement);
        const scene = new THREE.Scene(),
          camera = new THREE.PerspectiveCamera(42, 1, 0.01, 500);
        const pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        environment = pmrem.fromScene(room, 0.04);
        scene.environment = environment.texture;
        room.dispose();pmrem.dispose();
        scene.add(new THREE.HemisphereLight(0xe5edfa, 0x7c806f, 0.85));
        const sun = new THREE.DirectionalLight(0xfff1d9, 2.6);
        sun.position.set(5, 10, 6);
        sun.castShadow = true;
        sun.shadow.mapSize.set(2048, 2048);
        sun.shadow.bias = -0.0001;
        sun.shadow.normalBias = 0.008;
        scene.add(sun);
        scene.add(sun.target);
        const fill = new THREE.DirectionalLight(0xdde8ff, 0.45);
        fill.position.set(-6, 3, -4);
        scene.add(fill);
        const assembly = new THREE.Group();
        scene.add(assembly);
        floor = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshStandardMaterial({color:"#e9e7e1",roughness:1}));
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        floor.visible = true;
        scene.add(floor);
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.minDistance = 0.2;
        controls.maxDistance = 150;
        let fitCamera: (()=>void) | undefined;
        observer = new ResizeObserver(() => {
          const width = Math.max(1, host.clientWidth),
            height = Math.max(1, host.clientHeight);
          renderer?.setSize(width, height, false);
          camera.aspect = width / height;
          fitCamera?.();
          camera.updateProjectionMatrix();
          needsRender = true;
        });
        observer.observe(host);
        const draw = () => {
          if (disposed) return;
          const moved = controls?.update();
          if(needsRender || moved){renderer?.render(scene,camera);needsRender=false;}
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
          const target = center.clone();
          if (backgroundActive) target.y += size.length() * 0.025;
          camera.position
            .copy(target)
            .add(
              new THREE.Vector3(
                0.7,
                backgroundActive ? 0.77 : 0.5,
                0.85,
              ),
            );
          controls!.enabled = !backgroundActive;
          controls?.target.copy(target);
          fitCamera=()=>{
            const direction=camera.position.clone().sub(target).normalize();
            const right=new THREE.Vector3().crossVectors(camera.up,direction).normalize();
            const up=new THREE.Vector3().crossVectors(direction,right).normalize();
            const tan=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
            const aspect=Math.max(0.1,host.clientWidth/Math.max(1,host.clientHeight));
            let distance=0.25;
            for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
              const corner=new THREE.Vector3(x,y,z).sub(target);
              distance=Math.max(distance,corner.dot(direction)+Math.abs(corner.dot(right))*1.16/(tan*aspect),corner.dot(direction)+Math.abs(corner.dot(up))*1.16/tan);
            }
            camera.position.copy(target).addScaledVector(direction,distance);
            camera.aspect=aspect;camera.near=Math.max(0.001,distance/10000);camera.far=Math.max(100,distance*100);
            camera.updateProjectionMatrix();controls?.update();needsRender=true;
            camera.updateMatrixWorld();
            let extentX=0,extentY=0;
            for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
              const p=new THREE.Vector3(x,y,z).project(camera);extentX=Math.max(extentX,Math.abs(p.x));extentY=Math.max(extentY,Math.abs(p.y));
            }
            host.dataset.projectedExtent=[extentX,extentY].join(",");
          };
          fitCamera();
          if (floor) {
            floor.visible = true;
            floor.position.set(center.x, box.min.y - 0.003, center.z);
            floor.scale.setScalar(Math.max(size.x, size.z, 1) * 100);
          }
          const span = Math.max(size.x, size.z, 1);
          scene.fog = backgroundActive ? null : new THREE.Fog("#e9e7e1",span*3,span*12);
          sun.position.set(center.x-span*0.5,span*1.2,center.z+span*0.8);
          sun.target.position.copy(center);
          Object.assign(sun.shadow.camera, {left:-span,right:span,top:span,bottom:-span,near:0.1,far:span*5});
          sun.shadow.camera.updateProjectionMatrix();
          assembly.traverse(node=>{if(node instanceof THREE.Mesh){node.castShadow=true;node.receiveShadow=true}});
          host.dataset.presentation = fullCourt ? "finished-court" : "source-component";
          host.dataset.playingSurface = surface ? "true" : "false";
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
          renderer!.shadowMap.needsUpdate = true;
          needsRender = true;
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
          needsRender = true;
        };
        controller.current = { rebuild, recolor };
        if (backgroundUrl) {
          backdrop = new THREE.TextureLoader().load(backgroundUrl, texture=>{
            if(disposed){texture.dispose();return;}
            texture.colorSpace = THREE.SRGBColorSpace;
            scene.background = texture;
            if(floor){floor.material.dispose();floor.material=new THREE.ShadowMaterial({opacity:0.38});}
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
            if(fullCourt){
              finishProduct(template);
              surface=createPlayingSurface(template);
              if(surface)scene.add(surface);
            }
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
      backdrop?.dispose();
      environment?.dispose();
      if(surface){surface.geometry.dispose();surface.material.map?.dispose();surface.material.dispose();}
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
