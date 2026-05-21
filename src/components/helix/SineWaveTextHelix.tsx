import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';

// ─── Types ───────────────────────────────────────────────────────────
interface WavesConfig {
  speed: number;
  amplitude: number;
  frequency: number;
}

type Point3D = [number, number, number];

interface BezierCurve {
  start: Point3D;
  end: Point3D;
  controlPoint1: Point3D;
  controlPoint2: Point3D;
}

// ─── Configuration ───────────────────────────────────────────────────
const wavesConfig: WavesConfig = {
  speed: 0.15,
  amplitude: 0.12,
  frequency: 1,
};

const curves: BezierCurve[] = [
  {
    start: [0.6, -0.4, 0],
    end: [-1, 0.5, 0],
    controlPoint1: [0.9, -0.25, 0],
    controlPoint2: [-0.9, 0.85, 0],
  },
  {
    start: [-1, 0.5, 0],
    end: [0.6, -0.4, 0],
    controlPoint1: [-0.4, 1.2, 0],
    controlPoint2: [0.1, -0.9, 0],
  },
];

// ─── Text Texture Generation ─────────────────────────────────────────
function generateTextCanvas(fontSize: number, text: string): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = 4096;
  canvas.height = 4096;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 4096, 4096);
  ctx.fillStyle = '#1a2f23';
  ctx.font = `600 ${fontSize}px Inter, sans-serif`;
  ctx.textAlign = 'center';
  const metrics = ctx.measureText(text);
  ctx.fillText(text, 2048, 2048 + metrics.actualBoundingBoxAscent / 2);
  return canvas;
}

// ─── Curve & Path Logic ──────────────────────────────────────────────
function createWavyCurve(
  curveIndex: number,
  progress: number,
  { frequency, amplitude }: WavesConfig
): THREE.Vector3 {
  const curve = curves[curveIndex];
  const bezier = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...curve.start),
    new THREE.Vector3(...curve.controlPoint1),
    new THREE.Vector3(...curve.end)
  );
  const point = bezier.getPoint(progress);
  const tangent = bezier.getTangent(progress).normalize();
  const up = new THREE.Vector3(0, 0, 1);
  const axis = new THREE.Vector3().crossVectors(up, tangent).normalize();
  const phase = curveIndex === 0 ? 0 : Math.PI;
  point.applyAxisAngle(
    axis,
    Math.sin(progress * Math.PI * 2 * frequency + phase) * amplitude
  );
  return point;
}

// ─── MeshLine Component ──────────────────────────────────────────────
function WaveTextLine({
  curveIndex,
  canvasTexture,
}: {
  curveIndex: number;
  canvasTexture: THREE.CanvasTexture;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<MeshLineMaterial>(null);

  const width = useMemo(() => (window.innerWidth <= 680 ? 2 : 4), []);

  const points = useMemo(() => {
    return new Array(100).fill(0).map((_, i) =>
      createWavyCurve(curveIndex, i / 100, wavesConfig)
    );
  }, [curveIndex]);

  const { geometry, material } = useMemo(() => {
    const lineGeo = new MeshLineGeometry();
    const flatPoints = points.flatMap((p) => [p.x, p.y, p.z]);
    lineGeo.setPoints(flatPoints);

    const mat = new MeshLineMaterial({
      lineWidth: 0.35,
      dashArray: 1.99,
      dashOffset: 0,
      dashRatio: 0.98,
      opacity: 1,
      map: canvasTexture,
      useMap: 1,
      sizeAttenuation: 0,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      repeat: new THREE.Vector2(1, 1),
    });
    mat.transparent = true;
    mat.depthWrite = false;

    return { geometry: lineGeo, material: mat };
  }, [points, canvasTexture]);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.dashOffset -= 0.002 * wavesConfig.speed;
    }
  });

  return (
    <mesh ref={meshRef} scale={[width, width, 1]}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} ref={materialRef} attach="material" />
    </mesh>
  );
}

// ─── Scene Assembly ──────────────────────────────────────────────────
function HelixScene() {
  const groupRef = useRef<THREE.Group>(null);
  const [fontSize] = useState(575);
  const [text] = useState('FEDPOLYNAS RECORDS');

  const canvasTexture = useMemo(() => {
    const tex = new THREE.CanvasTexture(generateTextCanvas(fontSize, text));
    tex.wrapT = THREE.RepeatWrapping;
    tex.wrapS = THREE.RepeatWrapping;
    tex.needsUpdate = true;
    return tex;
  }, [fontSize, text]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z = Math.PI / 5;
    }
  });

  return (
    <group ref={groupRef}>
      <WaveTextLine curveIndex={0} canvasTexture={canvasTexture} />
      <WaveTextLine curveIndex={1} canvasTexture={canvasTexture} />
    </group>
  );
}

// ─── Exported Canvas Component ───────────────────────────────────────
export default function SineWaveTextHelix() {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        backgroundColor: '#d4e1d1',
      }}
    >
      <Canvas
        orthographic
        camera={{
          near: 0.01,
          far: 100,
          position: [0, 0, 10],
          left: -5,
          right: 5,
          top: 5,
          bottom: -5,
        }}
        dpr={Math.min(window.devicePixelRatio, 2)}
      >
        <HelixScene />
      </Canvas>
    </div>
  );
}
