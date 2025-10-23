import { openai } from './openai';

export interface Scene3D {
  id: string;
  title: string;
  description: string;
  duration: number;
  elements: SceneElement[];
  camera: CameraSettings;
  lighting: LightingSettings;
  audio?: AudioSettings;
  exportFormats: string[];
  createdAt: string;
}

export interface SceneElement {
  id: string;
  type: 'character' | 'prop' | 'text' | 'environment' | 'effect';
  name: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
  material: MaterialSettings;
  animation?: AnimationSettings;
  aiGenerated: boolean;
  prompt?: string;
}

export interface CameraSettings {
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
  fov: number;
  near: number;
  far: number;
  movement: CameraMovement[];
}

export interface CameraMovement {
  type: 'pan' | 'zoom' | 'rotate' | 'follow';
  duration: number;
  startTime: number;
  endTime: number;
  target?: { x: number; y: number; z: number };
  easing: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
}

export interface LightingSettings {
  ambient: { color: string; intensity: number };
  directional: { color: string; intensity: number; position: { x: number; y: number; z: number } };
  pointLights: Array<{ color: string; intensity: number; position: { x: number; y: number; z: number } }>;
  shadows: boolean;
  environmentMap?: string;
}

export interface MaterialSettings {
  type: 'basic' | 'phong' | 'standard' | 'physical';
  color: string;
  metalness: number;
  roughness: number;
  opacity: number;
  emissive: string;
  normalMap?: string;
  diffuseMap?: string;
  specularMap?: string;
}

export interface AnimationSettings {
  type: 'rotation' | 'translation' | 'scale' | 'morph';
  duration: number;
  loop: boolean;
  keyframes: Array<{
    time: number;
    value: any;
    easing: string;
  }>;
}

export interface AudioSettings {
  backgroundMusic?: string;
  soundEffects: Array<{
    file: string;
    startTime: number;
    volume: number;
    loop: boolean;
  }>;
  spatialAudio: boolean;
  reverb: boolean;
}

// 3D Scene Generator Service
export class Scene3DGenerator {
  private sceneCache = new Map<string, Scene3D>();

  // Generate 3D scene from video idea
  async generateScene(
    videoIdea: string,
    platform: 'tiktok' | 'youtube-shorts' | 'instagram' | 'instagram-stories',
    duration: number = 15
  ): Promise<Scene3D> {
    try {
      // Generate scene description using OpenAI
      const sceneDescription = await this.generateSceneDescription(videoIdea, platform, duration);
      
      // Parse scene elements from description
      const elements = await this.parseSceneElements(sceneDescription);
      
      // Generate camera movements
      const camera = await this.generateCameraSettings(elements, duration);
      
      // Generate lighting setup
      const lighting = await this.generateLightingSettings(sceneDescription);
      
      // Generate audio settings
      const audio = await this.generateAudioSettings(sceneDescription, duration);

      const scene: Scene3D = {
        id: `scene_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: this.extractTitle(videoIdea),
        description: sceneDescription,
        duration,
        elements,
        camera,
        lighting,
        audio,
        exportFormats: ['glb', 'fbx', 'obj', 'gltf'],
        createdAt: new Date().toISOString(),
      };

      // Cache the scene
      this.sceneCache.set(scene.id, scene);

      return scene;
    } catch (error) {
      console.error('Error generating 3D scene:', error);
      throw error;
    }
  }

  private async generateSceneDescription(
    videoIdea: string,
    platform: string,
    duration: number
  ): Promise<string> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a 3D scene director. Create a detailed 3D scene description for a ${platform} video that is ${duration} seconds long. Include:
            - Scene setting and environment
            - Characters and their positions
            - Props and objects
            - Camera angles and movements
            - Lighting mood and atmosphere
            - Visual effects and animations
            
            Focus on creating engaging, viral-worthy content that works well in a 3D environment.`
          },
          {
            role: "user",
            content: `Video idea: "${videoIdea}"`
          }
        ],
        temperature: 0.8,
        max_tokens: 1000,
      });

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error generating scene description:', error);
      throw error;
    }
  }

  private async parseSceneElements(description: string): Promise<SceneElement[]> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Parse the 3D scene description and extract all elements. Return a JSON array with:
            - type: character, prop, text, environment, effect
            - name: descriptive name
            - position: {x, y, z} coordinates
            - rotation: {x, y, z} in degrees
            - scale: {x, y, z} multipliers
            - material: basic material properties
            - animation: if applicable
            - aiGenerated: true/false
            - prompt: AI generation prompt if applicable`
          },
          {
            role: "user",
            content: description
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      });

      const elements = JSON.parse(response.choices[0]?.message?.content || '[]');
      return elements.map((element: any, index: number) => ({
        id: `element_${index}`,
        ...element,
        aiGenerated: true,
        prompt: element.prompt || this.generateElementPrompt(element),
      }));
    } catch (error) {
      console.error('Error parsing scene elements:', error);
      return [];
    }
  }

  private generateElementPrompt(element: any): string {
    const basePrompt = `3D ${element.type}: ${element.name}`;
    const stylePrompt = element.material?.type === 'physical' ? ', photorealistic' : ', stylized';
    const colorPrompt = element.material?.color ? `, ${element.material.color} color` : '';
    
    return `${basePrompt}${stylePrompt}${colorPrompt}, high quality, detailed`;
  }

  private async generateCameraSettings(elements: SceneElement[], duration: number): Promise<CameraSettings> {
    // Calculate scene bounds
    const bounds = this.calculateSceneBounds(elements);
    
    // Generate dynamic camera movements
    const movements = this.generateCameraMovements(bounds, duration);
    
    return {
      position: { x: 0, y: 2, z: 5 },
      target: { x: 0, y: 0, z: 0 },
      fov: 75,
      near: 0.1,
      far: 1000,
      movement: movements,
    };
  }

  private calculateSceneBounds(elements: SceneElement[]): { min: { x: number; y: number; z: number }; max: { x: number; y: number; z: number } } {
    if (elements.length === 0) {
      return {
        min: { x: -5, y: -5, z: -5 },
        max: { x: 5, y: 5, z: 5 },
      };
    }

    const positions = elements.map(el => el.position);
    const min = {
      x: Math.min(...positions.map(p => p.x)),
      y: Math.min(...positions.map(p => p.y)),
      z: Math.min(...positions.map(p => p.z)),
    };
    const max = {
      x: Math.max(...positions.map(p => p.x)),
      y: Math.max(...positions.map(p => p.y)),
      z: Math.max(...positions.map(p => p.z)),
    };

    return { min, max };
  }

  private generateCameraMovements(bounds: any, duration: number): CameraMovement[] {
    const movements: CameraMovement[] = [];
    
    // Start with establishing shot
    movements.push({
      type: 'pan',
      duration: duration * 0.3,
      startTime: 0,
      endTime: duration * 0.3,
      target: { x: bounds.min.x, y: bounds.max.y, z: bounds.max.z },
      easing: 'easeInOut',
    });

    // Close-up on main character
    movements.push({
      type: 'zoom',
      duration: duration * 0.4,
      startTime: duration * 0.3,
      endTime: duration * 0.7,
      target: { x: 0, y: 0, z: 2 },
      easing: 'easeInOut',
    });

    // Final wide shot
    movements.push({
      type: 'pan',
      duration: duration * 0.3,
      startTime: duration * 0.7,
      endTime: duration,
      target: { x: bounds.max.x, y: bounds.min.y, z: bounds.min.z },
      easing: 'easeOut',
    });

    return movements;
  }

  private async generateLightingSettings(description: string): Promise<LightingSettings> {
    // Analyze description for mood and lighting requirements
    const isDark = description.toLowerCase().includes('dark') || description.toLowerCase().includes('night');
    const isBright = description.toLowerCase().includes('bright') || description.toLowerCase().includes('day');
    const isDramatic = description.toLowerCase().includes('dramatic') || description.toLowerCase().includes('cinematic');

    return {
      ambient: {
        color: isDark ? '#1a1a2e' : '#ffffff',
        intensity: isDark ? 0.2 : 0.4,
      },
      directional: {
        color: isBright ? '#ffffff' : '#ffd700',
        intensity: isDramatic ? 1.5 : 1.0,
        position: { x: 10, y: 10, z: 5 },
      },
      pointLights: isDramatic ? [
        {
          color: '#ff6b6b',
          intensity: 0.8,
          position: { x: -5, y: 3, z: 0 },
        },
        {
          color: '#4ecdc4',
          intensity: 0.6,
          position: { x: 5, y: 3, z: 0 },
        },
      ] : [],
      shadows: true,
      environmentMap: isDark ? 'night_sky' : 'studio',
    };
  }

  private async generateAudioSettings(description: string, duration: number): Promise<AudioSettings> {
    const mood = this.detectMood(description);
    
    return {
      backgroundMusic: this.getMoodMusic(mood),
      soundEffects: this.generateSoundEffects(description, duration),
      spatialAudio: true,
      reverb: mood === 'dramatic' || mood === 'cinematic',
    };
  }

  private detectMood(description: string): string {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('dramatic') || lowerDesc.includes('intense')) return 'dramatic';
    if (lowerDesc.includes('happy') || lowerDesc.includes('fun')) return 'happy';
    if (lowerDesc.includes('sad') || lowerDesc.includes('melancholy')) return 'sad';
    if (lowerDesc.includes('mysterious') || lowerDesc.includes('suspense')) return 'mysterious';
    if (lowerDesc.includes('energetic') || lowerDesc.includes('fast')) return 'energetic';
    
    return 'neutral';
  }

  private getMoodMusic(mood: string): string {
    const musicMap: Record<string, string> = {
      dramatic: 'epic_orchestral.mp3',
      happy: 'upbeat_electronic.mp3',
      sad: 'melancholic_piano.mp3',
      mysterious: 'ambient_dark.mp3',
      energetic: 'high_energy_edm.mp3',
      neutral: 'ambient_loops.mp3',
    };
    
    return musicMap[mood] || musicMap.neutral;
  }

  private generateSoundEffects(description: string, duration: number): Array<{ file: string; startTime: number; volume: number; loop: boolean }> {
    const effects: Array<{ file: string; startTime: number; volume: number; loop: boolean }> = [];
    
    // Add sound effects based on description
    if (description.toLowerCase().includes('explosion')) {
      effects.push({
        file: 'explosion.mp3',
        startTime: duration * 0.5,
        volume: 0.8,
        loop: false,
      });
    }
    
    if (description.toLowerCase().includes('footsteps')) {
      effects.push({
        file: 'footsteps.mp3',
        startTime: 0,
        volume: 0.3,
        loop: true,
      });
    }
    
    if (description.toLowerCase().includes('wind')) {
      effects.push({
        file: 'wind_ambient.mp3',
        startTime: 0,
        volume: 0.2,
        loop: true,
      });
    }
    
    return effects;
  }

  private extractTitle(videoIdea: string): string {
    // Extract a short title from the video idea
    const words = videoIdea.split(' ').slice(0, 5);
    return words.join(' ').replace(/[^\w\s]/g, '');
  }

  // Generate AI avatars for characters
  async generateCharacterAvatar(characterPrompt: string): Promise<{
    modelUrl: string;
    textures: string[];
    animations: string[];
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Generate a 3D character description for: "${characterPrompt}". Include:
            - Physical appearance details
            - Clothing and accessories
            - Facial features and expressions
            - Body proportions
            - Suggested animations (idle, walk, talk, etc.)
            
            Return as JSON with modelUrl, textures array, and animations array.`
          },
          {
            role: "user",
            content: characterPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const characterData = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        modelUrl: characterData.modelUrl || 'default_character.glb',
        textures: characterData.textures || ['skin_diffuse.jpg', 'clothing_diffuse.jpg'],
        animations: characterData.animations || ['idle', 'walk', 'wave'],
      };
    } catch (error) {
      console.error('Error generating character avatar:', error);
      return {
        modelUrl: 'default_character.glb',
        textures: ['skin_diffuse.jpg'],
        animations: ['idle'],
      };
    }
  }

  // Generate procedural environments
  async generateEnvironment(environmentPrompt: string): Promise<{
    geometry: string;
    materials: MaterialSettings[];
    lighting: LightingSettings;
    skybox: string;
  }> {
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `Generate a 3D environment description for: "${environmentPrompt}". Include:
            - Terrain and landscape features
            - Buildings and structures
            - Vegetation and natural elements
            - Atmospheric conditions
            - Color palette and mood
            - Lighting requirements
            
            Return as JSON with geometry, materials array, lighting object, and skybox.`
          },
          {
            role: "user",
            content: environmentPrompt
          }
        ],
        temperature: 0.8,
        max_tokens: 800,
      });

      const environmentData = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        geometry: environmentData.geometry || 'procedural_terrain',
        materials: environmentData.materials || [{
          type: 'standard',
          color: '#8FBC8F',
          metalness: 0.1,
          roughness: 0.8,
          opacity: 1.0,
          emissive: '#000000',
        }],
        lighting: environmentData.lighting || {
          ambient: { color: '#87CEEB', intensity: 0.3 },
          directional: { color: '#FFFFFF', intensity: 1.0, position: { x: 10, y: 10, z: 5 } },
          pointLights: [],
          shadows: true,
        },
        skybox: environmentData.skybox || 'blue_sky',
      };
    } catch (error) {
      console.error('Error generating environment:', error);
      return {
        geometry: 'default_environment',
        materials: [],
        lighting: {
          ambient: { color: '#87CEEB', intensity: 0.3 },
          directional: { color: '#FFFFFF', intensity: 1.0, position: { x: 10, y: 10, z: 5 } },
          pointLights: [],
          shadows: true,
        },
        skybox: 'blue_sky',
      };
    }
  }

  // Export scene to various formats
  async exportScene(sceneId: string, format: 'glb' | 'fbx' | 'obj' | 'gltf'): Promise<string> {
    const scene = this.sceneCache.get(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    // In a real implementation, this would use Three.js exporters
    // For now, return a mock export URL
    const exportUrl = `https://api.example.com/scenes/${sceneId}/export/${format}`;
    
    // Store export request
    await this.storeExportRequest(sceneId, format, exportUrl);
    
    return exportUrl;
  }

  private async storeExportRequest(sceneId: string, format: string, url: string): Promise<void> {
    try {
      // Store export request in database
      console.log(`Export request: ${sceneId} -> ${format} -> ${url}`);
    } catch (error) {
      console.error('Error storing export request:', error);
    }
  }

  // Get scene by ID
  getScene(sceneId: string): Scene3D | undefined {
    return this.sceneCache.get(sceneId);
  }

  // List all scenes
  getAllScenes(): Scene3D[] {
    return Array.from(this.sceneCache.values());
  }

  // Delete scene
  deleteScene(sceneId: string): boolean {
    return this.sceneCache.delete(sceneId);
  }

  // Update scene
  updateScene(sceneId: string, updates: Partial<Scene3D>): boolean {
    const scene = this.sceneCache.get(sceneId);
    if (!scene) return false;

    const updatedScene = { ...scene, ...updates };
    this.sceneCache.set(sceneId, updatedScene);
    return true;
  }
}

// Export singleton instance
export const scene3DGenerator = new Scene3DGenerator();
