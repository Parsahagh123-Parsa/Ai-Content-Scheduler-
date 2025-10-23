'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Box, Sphere, Plane, useTexture } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

interface ContentPlan {
  id: string;
  title: string;
  platform: string;
  engagement: number;
  viralPotential: number;
  date: string;
  thumbnail?: string;
}

interface Dashboard3DProps {
  contentPlans: ContentPlan[];
  onCardClick: (plan: ContentPlan) => void;
  className?: string;
}

// Floating content card component
function ContentCard({ 
  plan, 
  position, 
  onClick, 
  isHovered, 
  onHover 
}: { 
  plan: ContentPlan; 
  position: [number, number, number]; 
  onClick: () => void;
  isHovered: boolean;
  onHover: (hovered: boolean) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1;
      
      // Rotation animation
      meshRef.current.rotation.y += 0.01;
      
      // Scale on hover
      const targetScale = hovered || isHovered ? 1.2 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
  });

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'tiktok': return '#ff0050';
      case 'youtube': return '#ff0000';
      case 'instagram': return '#e4405f';
      default: return '#6366f1';
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 80) return '#10b981';
    if (engagement >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <group position={position}>
      {/* Main card */}
      <Box
        ref={meshRef}
        args={[2, 1.5, 0.2]}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
      >
        <meshStandardMaterial
          color={getPlatformColor(plan.platform)}
          transparent
          opacity={0.8}
          roughness={0.2}
          metalness={0.1}
        />
      </Box>
      
      {/* Engagement indicator */}
      <Sphere
        position={[0.8, 0.6, 0.3]}
        args={[0.1]}
      >
        <meshStandardMaterial color={getEngagementColor(plan.engagement)} />
      </Sphere>
      
      {/* Viral potential indicator */}
      <Box
        position={[0, -0.6, 0.3]}
        args={[plan.viralPotential / 50, 0.1, 0.1]}
      >
        <meshStandardMaterial color="#8b5cf6" />
      </Box>
      
      {/* Title text */}
      <Text
        position={[0, 0, 0.2]}
        fontSize={0.2}
        color="white"
        anchorX="center"
        anchorY="middle"
        maxWidth={1.8}
      >
        {plan.title}
      </Text>
      
      {/* Platform text */}
      <Text
        position={[0, -0.3, 0.2]}
        fontSize={0.15}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {plan.platform}
      </Text>
      
      {/* Hover glow effect */}
      {hovered && (
        <Box
          args={[2.2, 1.7, 0.1]}
          position={[0, 0, -0.1]}
        >
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.1}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </Box>
      )}
    </group>
  );
}

// Central AI orb
function AIOrb({ isActive }: { isActive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.5;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      // Pulsing animation
      const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      <Sphere ref={meshRef} args={[0.5]}>
        <meshStandardMaterial
          color={isActive ? "#8b5cf6" : "#6366f1"}
          transparent
          opacity={0.8}
          emissive={isActive ? "#8b5cf6" : "#6366f1"}
          emissiveIntensity={isActive ? 0.3 : 0.1}
          roughness={0.1}
          metalness={0.9}
        />
      </Sphere>
      
      {/* Inner core */}
      <Sphere args={[0.3]}>
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.6}
          emissive="#ffffff"
          emissiveIntensity={0.2}
        />
      </Sphere>
      
      {/* Energy rings */}
      <Box args={[1.2, 0.05, 0.05]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
      </Box>
      <Box args={[1.2, 0.05, 0.05]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial
          color="#8b5cf6"
          transparent
          opacity={0.3}
          emissive="#8b5cf6"
          emissiveIntensity={0.1}
        />
      </Box>
    </group>
  );
}

// Particle system
function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = 200;

  useEffect(() => {
    if (pointsRef.current) {
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);

      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

        colors[i * 3] = Math.random() * 0.5 + 0.5; // R
        colors[i * 3 + 1] = Math.random() * 0.5 + 0.5; // G
        colors[i * 3 + 2] = Math.random() * 0.5 + 0.5; // B
      }

      pointsRef.current.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      pointsRef.current.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry />
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  );
}

// Main 3D scene
function Scene3D({ contentPlans, onCardClick }: { contentPlans: ContentPlan[]; onCardClick: (plan: ContentPlan) => void }) {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Arrange content cards in a circle
  const cardPositions = contentPlans.map((plan, index) => {
    const angle = (index / contentPlans.length) * Math.PI * 2;
    const radius = 8;
    return [
      Math.cos(angle) * radius,
      Math.sin(angle) * 0.5,
      Math.sin(angle) * radius
    ] as [number, number, number];
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <pointLight position={[0, 0, 0]} intensity={0.5} color="#8b5cf6" />
      
      {/* Particle field */}
      <ParticleField />
      
      {/* AI Orb */}
      <AIOrb isActive={isGenerating} />
      
      {/* Content cards */}
      {contentPlans.map((plan, index) => (
        <ContentCard
          key={plan.id}
          plan={plan}
          position={cardPositions[index]}
          onClick={() => onCardClick(plan)}
          isHovered={hoveredCard === plan.id}
          onHover={(hovered) => setHoveredCard(hovered ? plan.id : null)}
        />
      ))}
      
      {/* Ground plane */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <meshStandardMaterial
          color="#1a1a2e"
          transparent
          opacity={0.3}
        />
      </Plane>
    </>
  );
}

// Main component
export default function Dashboard3DEnhanced({ contentPlans, onCardClick, className = '' }: Dashboard3DProps) {
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleCardClick = (plan: ContentPlan) => {
    setSelectedPlan(plan);
    onCardClick(plan);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Generate sample data if none provided
  const samplePlans: ContentPlan[] = contentPlans.length > 0 ? contentPlans : [
    {
      id: '1',
      title: 'Morning Workout Routine',
      platform: 'TikTok',
      engagement: 85,
      viralPotential: 92,
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'Tech Review: iPhone 15',
      platform: 'YouTube',
      engagement: 78,
      viralPotential: 88,
      date: '2024-01-16'
    },
    {
      id: '3',
      title: 'Fashion Haul',
      platform: 'Instagram',
      engagement: 72,
      viralPotential: 76,
      date: '2024-01-17'
    },
    {
      id: '4',
      title: 'Cooking Tutorial',
      platform: 'TikTok',
      engagement: 91,
      viralPotential: 95,
      date: '2024-01-18'
    },
    {
      id: '5',
      title: 'Travel Vlog',
      platform: 'YouTube',
      engagement: 67,
      viralPotential: 82,
      date: '2024-01-19'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 space-y-2">
        <button
          onClick={toggleFullscreen}
          className="px-4 py-2 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg text-white hover:bg-opacity-30 transition-all"
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
        
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-3 text-white text-sm">
          <div className="font-semibold mb-2">Controls:</div>
          <div>• Click and drag to rotate</div>
          <div>• Scroll to zoom</div>
          <div>• Click cards to select</div>
        </div>
      </div>

      {/* Stats overlay */}
      <div className="absolute top-4 right-4 z-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 text-white">
        <div className="text-lg font-semibold mb-2">Content Stats</div>
        <div className="space-y-1 text-sm">
          <div>Total Plans: {samplePlans.length}</div>
          <div>Avg Engagement: {Math.round(samplePlans.reduce((acc, plan) => acc + plan.engagement, 0) / samplePlans.length)}%</div>
          <div>Avg Viral Potential: {Math.round(samplePlans.reduce((acc, plan) => acc + plan.viralPotential, 0) / samplePlans.length)}%</div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-96'} bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg overflow-hidden`}>
        <Canvas camera={{ position: [0, 5, 10], fov: 60 }}>
          <Scene3D contentPlans={samplePlans} onCardClick={handleCardClick} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
          />
        </Canvas>
      </div>

      {/* Selected plan details */}
      {selectedPlan && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-4 left-4 right-4 z-10 bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 text-white"
        >
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold">{selectedPlan.title}</h3>
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-gray-300 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-300">Platform</div>
              <div className="font-semibold">{selectedPlan.platform}</div>
            </div>
            <div>
              <div className="text-gray-300">Engagement</div>
              <div className="font-semibold text-green-400">{selectedPlan.engagement}%</div>
            </div>
            <div>
              <div className="text-gray-300">Viral Potential</div>
              <div className="font-semibold text-purple-400">{selectedPlan.viralPotential}%</div>
            </div>
            <div>
              <div className="text-gray-300">Date</div>
              <div className="font-semibold">{selectedPlan.date}</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
