'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Torus } from '@react-three/drei';
import * as THREE from 'three';

interface FloatingCardProps {
  position: [number, number, number];
  content: string;
  color: string;
  delay?: number;
}

function FloatingCard({ position, content, color, delay = 0 }: FloatingCardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + delay) * 0.1;
    }
  });

  return (
    <Box
      ref={meshRef}
      position={position}
      args={[2, 1, 0.1]}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.1 : 1}
    >
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.8}
        roughness={0.1}
        metalness={0.3}
      />
      <Text
        position={[0, 0, 0.06]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {content}
      </Text>
    </Box>
  );
}

function NeuralPulse() {
  const meshRef = useRef<THREE.Mesh>(null);
  const [pulse, setPulse] = useState(0);

  useFrame((state) => {
    if (meshRef.current) {
      const pulseValue = Math.sin(state.clock.elapsedTime * 2) * 0.5 + 0.5;
      setPulse(pulseValue);
      meshRef.current.scale.setScalar(1 + pulseValue * 0.3);
    }
  });

  return (
    <Sphere ref={meshRef} args={[1, 32, 32]} position={[0, 0, 0]}>
      <meshStandardMaterial
        color="#00ff88"
        transparent
        opacity={0.6 + pulse * 0.4}
        emissive="#00ff88"
        emissiveIntensity={pulse}
      />
    </Sphere>
  );
}

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 1000;

  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      pointsRef.current.rotation.x += 0.0005;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleCount}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.02} vertexColors transparent opacity={0.6} />
    </points>
  );
}

function AmbientLighting() {
  const { scene } = useThree();
  const [lightColor, setLightColor] = useState('#667eea');

  useEffect(() => {
    const interval = setInterval(() => {
      const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
      setLightColor(colors[Math.floor(Math.random() * colors.length)]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scene.fog = new THREE.Fog(lightColor, 5, 20);
  }, [lightColor, scene]);

  return (
    <>
      <ambientLight intensity={0.4} color={lightColor} />
      <pointLight position={[10, 10, 10]} intensity={1} color={lightColor} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color={lightColor} />
    </>
  );
}

interface Dashboard3DProps {
  contentPlans: any[];
  onCardClick: (plan: any) => void;
}

export default function Dashboard3D({ contentPlans, onCardClick }: Dashboard3DProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const cardData = [
    { content: 'AI Content', color: '#ff6b6b', position: [3, 2, 0] as [number, number, number] },
    { content: 'Trends', color: '#4ecdc4', position: [-3, 2, 0] as [number, number, number] },
    { content: 'Analytics', color: '#45b7d1', position: [0, -2, 3] as [number, number, number] },
    { content: 'Schedule', color: '#f9ca24', position: [0, 2, -3] as [number, number, number] },
  ];

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
        <AmbientLighting />
        <ParticleField />
        
        {isGenerating && <NeuralPulse />}
        
        {cardData.map((card, index) => (
          <FloatingCard
            key={index}
            position={card.position}
            content={card.content}
            color={card.color}
            delay={index * 0.5}
          />
        ))}

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={20}
        />
      </Canvas>
      
      <div className="absolute top-4 left-4 text-white">
        <h2 className="text-2xl font-bold mb-2">3D Content Dashboard</h2>
        <p className="text-blue-200">Navigate with mouse to explore your content universe</p>
      </div>

      <div className="absolute bottom-4 left-4 text-white">
        <button
          onClick={() => setIsGenerating(!isGenerating)}
          className="bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-3 rounded-lg font-bold hover:scale-105 transition-transform"
        >
          {isGenerating ? 'Stop AI Generation' : 'Start AI Generation'}
        </button>
      </div>

      <div className="absolute top-4 right-4 text-white">
        <div className="bg-white/10 backdrop-blur-xl rounded-lg p-4 border border-white/20">
          <h3 className="font-bold mb-2">Controls</h3>
          <ul className="text-sm space-y-1">
            <li>🖱️ Left click + drag: Rotate</li>
            <li>🖱️ Right click + drag: Pan</li>
            <li>🖱️ Scroll: Zoom</li>
            <li>🎯 Hover cards for details</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
