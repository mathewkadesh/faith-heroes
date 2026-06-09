import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment, Grid } from '@react-three/drei';
import { RotateCcw } from 'lucide-react';

function Model({ url }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.5} />;
}

function FallbackBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#8B1A1A" />
    </mesh>
  );
}

export default function ThreeViewer({ modelUrl, autoRotate: controlledAutoRotate }) {
  const [autoSpin, setAutoSpin] = useState(true);
  const shouldAutoRotate = controlledAutoRotate ?? autoSpin;

  if (!modelUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted text-sm">
        No 3D model available
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 0, 4], fov: 45 }}
        style={{ background: 'linear-gradient(135deg, #0A0505 0%, #180C0C 100%)' }}>
        <ambientLight intensity={0.5} color="#C9A84C" />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#8B1A1A" />
        <Suspense fallback={<FallbackBox />}>
          <Model url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <Grid renderOrder={-1} position={[0, -1.5, 0]} infiniteGrid cellSize={0.5}
          cellThickness={0.5} cellColor="#2A1010" sectionSize={3} sectionThickness={1}
          sectionColor="#C9A84C" fadeDistance={20} fadeStrength={1} />
        <OrbitControls autoRotate={shouldAutoRotate} autoRotateSpeed={2} enablePan={false} />
      </Canvas>

      {controlledAutoRotate === undefined && <button onClick={() => setAutoSpin(s => !s)}
        className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm border border-gold/20 text-gold rounded-lg px-3 py-1.5 text-xs flex items-center gap-1.5 hover:bg-card transition-colors">
        <RotateCcw size={12} />
        {autoSpin ? 'Stop Spin' : 'Auto Spin'}
      </button>}
    </div>
  );
}
