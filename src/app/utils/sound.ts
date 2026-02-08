// Sound utility using Web Audio API for synthesized sounds
// This avoids the need for external audio files and ensures instant playback

class SoundManager {
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  constructor() {
    this.initAudio();
  }

  private initAudio() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.connect(this.audioContext.destination);
        this.masterGain.gain.value = 0.3; // Global volume
      } catch (e) {
        console.warn('Web Audio API not supported');
      }
    }
  }

  private ensureContext() {
    if (!this.audioContext) {
      this.initAudio();
    }
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Create a simple oscillator sound
  private playTone(
    frequency: number,
    type: OscillatorType,
    duration: number,
    startTime: number = 0,
    volume: number = 1
  ) {
    if (!this.audioContext || !this.masterGain || this.isMuted) return;

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime + startTime);

    gainNode.gain.setValueAtTime(volume, this.audioContext.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + startTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);

    oscillator.start(this.audioContext.currentTime + startTime);
    oscillator.stop(this.audioContext.currentTime + startTime + duration);
  }

  public playSuccess() {
    this.ensureContext();
    // Happy major chord ascending
    this.playTone(523.25, 'sine', 0.1, 0); // C5
    this.playTone(659.25, 'sine', 0.1, 0.1); // E5
    this.playTone(783.99, 'sine', 0.2, 0.2); // G5
    this.playTone(1046.50, 'sine', 0.4, 0.3); // C6
  }

  public playCompletion() {
    this.ensureContext();
    // Victory fanfare
    this.playTone(523.25, 'square', 0.1, 0, 0.2); // C5
    this.playTone(523.25, 'square', 0.1, 0.1, 0.2); // C5
    this.playTone(523.25, 'square', 0.1, 0.2, 0.2); // C5
    this.playTone(698.46, 'square', 0.6, 0.3, 0.2); // F5
  }

  public playStart() {
    this.ensureContext();
    // Rising futuristic swipe
    if (!this.audioContext || !this.masterGain || this.isMuted) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(800, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  public playStop() {
    this.ensureContext();
    // Falling futuristic swipe
    if (!this.audioContext || !this.masterGain || this.isMuted) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.3);
    
    gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.masterGain);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  public playTick() {
    this.ensureContext();
    // Soft tick for timer
    this.playTone(800, 'sine', 0.05, 0, 0.05);
  }

  public playNotification() {
    this.ensureContext();
    // Gentle bubble pop
    this.playTone(400, 'sine', 0.1, 0);
    this.playTone(600, 'sine', 0.2, 0.05);
  }

  public playError() {
    this.ensureContext();
    // Discordant buzz
    this.playTone(150, 'sawtooth', 0.3, 0, 0.2);
    this.playTone(140, 'sawtooth', 0.3, 0, 0.2);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const soundManager = new SoundManager();
