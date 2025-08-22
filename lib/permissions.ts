// Camera and Microphone Permissions Handler
export class PermissionsManager {
  private static instance: PermissionsManager;
  private permissions: { [key: string]: boolean } = {};

  public static getInstance(): PermissionsManager {
    if (!PermissionsManager.instance) {
      PermissionsManager.instance = new PermissionsManager();
    }
    return PermissionsManager.instance;
  }

  async requestCameraPermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the stream immediately - we just needed permissions
      stream.getTracks().forEach(track => track.stop());
      this.permissions.camera = true;
      return true;
    } catch (error: any) {
      console.error('Camera permission denied:', error);
      this.permissions.camera = false;
      return false;
    }
  }

  async requestMicrophonePermission(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000
        }
      });
      
      // Stop the stream immediately - we just needed permissions
      stream.getTracks().forEach(track => track.stop());
      this.permissions.microphone = true;
      return true;
    } catch (error: any) {
      console.error('Microphone permission denied:', error);
      this.permissions.microphone = false;
      return false;
    }
  }

  async requestBothPermissions(): Promise<{ camera: boolean; microphone: boolean }> {
    const [camera, microphone] = await Promise.all([
      this.requestCameraPermission(),
      this.requestMicrophonePermission()
    ]);

    return { camera, microphone };
  }

  hasPermission(type: 'camera' | 'microphone'): boolean {
    return this.permissions[type] || false;
  }

  async checkPermissionStatus(): Promise<{ camera: PermissionState; microphone: PermissionState }> {
    if (!navigator.permissions) {
      return { camera: 'prompt', microphone: 'prompt' };
    }

    try {
      const [cameraPermission, micPermission] = await Promise.all([
        navigator.permissions.query({ name: 'camera' as PermissionName }),
        navigator.permissions.query({ name: 'microphone' as PermissionName })
      ]);

      return {
        camera: cameraPermission.state,
        microphone: micPermission.state
      };
    } catch (error) {
      console.error('Error checking permissions:', error);
      return { camera: 'prompt', microphone: 'prompt' };
    }
  }

  getPermissionErrorMessage(type: 'camera' | 'microphone', error?: any): string {
    const messages = {
      camera: {
        NotAllowedError: 'Camera access denied. Please enable camera permissions in your browser settings to scan barcodes.',
        NotFoundError: 'No camera found on this device. Barcode scanning requires a camera.',
        NotReadableError: 'Camera is already in use by another application.',
        OverconstrainedError: 'Camera doesn\'t support the required settings.',
        default: 'Camera access failed. Please check your browser settings and try again.'
      },
      microphone: {
        NotAllowedError: 'Microphone access denied. Please enable microphone permissions in your browser settings for voice commands.',
        NotFoundError: 'No microphone found on this device. Voice commands require a microphone.',
        NotReadableError: 'Microphone is already in use by another application.',
        OverconstrainedError: 'Microphone doesn\'t support the required settings.',
        default: 'Microphone access failed. Please check your browser settings and try again.'
      }
    };

    const errorName = error?.name || 'default';
    return messages[type][errorName as keyof typeof messages[typeof type]] || messages[type].default;
  }

  static getUsageDescriptions() {
    return {
      camera: {
        title: 'Camera Access',
        description: 'ChefGrocer uses your camera to scan product barcodes for instant nutrition information, ingredient identification, and to add items to your grocery list.',
        features: [
          '📱 Scan barcodes on food products',
          '🥬 Identify ingredients and nutrition facts',
          '🛒 Add items directly to grocery lists',
          '⚡ Get instant USDA nutrition data'
        ]
      },
      microphone: {
        title: 'Microphone Access', 
        description: 'ChefGrocer uses your microphone for voice-activated recipe search, cooking timers, and hands-free meal planning while your hands are busy cooking.',
        features: [
          '🗣️ Voice-activated recipe search',
          '⏰ Voice-controlled cooking timers',
          '👨‍🍳 Hands-free cooking assistance',
          '🥗 Voice meal planning and suggestions'
        ]
      }
    };
  }
}