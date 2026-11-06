// Radio Player Controller for SomaFM streams & Ambient Noise Synthesizer

export interface Station {
  name: string;
  url: string;
}

export const STATIONS: Station[] = [
  { name: 'GROOVE SALAD', url: 'https://ice1.somafm.com/groovesalad-128-mp3' },
  { name: 'LUSH', url: 'https://ice1.somafm.com/lush-128-mp3' },
  { name: 'DRONE ZONE', url: 'https://ice1.somafm.com/dronezone-128-mp3' }
];

// Ambient Wind & Room Atmosphere Synthesizer via Web Audio API
export class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isRunning = false;
  private lfo: OscillatorNode | null = null;
  private source: AudioBufferSourceNode | null = null;

  start() {
    if (this.isRunning) return;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Create 5-second Pink/Brown noise buffer for organic air/wind
    const bufferSize = ctx.sampleRate * 5;
    const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);

    for (let channel = 0; channel < 2; channel++) {
      const data = noiseBuffer.getChannelData(channel);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.065;
        b6 = white * 0.115926;
      }
    }

    // Source node looping
    this.source = ctx.createBufferSource();
    this.source.buffer = noiseBuffer;
    this.source.loop = true;

    // Filters for atmospheric wind
    // 1. Highpass to remove sub rumble
    const highpass = ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = 75;

    // 2. Lowpass for velvety body
    const lowpass = ctx.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = 520;
    lowpass.Q.value = 1.8;

    // 3. Modulated Bandpass for gentle wind gusts
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 380;
    bandpass.Q.value = 3.0;

    // LFO for slow breathing wind modulation (0.16 Hz)
    this.lfo = ctx.createOscillator();
    this.lfo.frequency.value = 0.16;

    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 240; // modulate cutoff by +/- 240 Hz

    this.lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);

    // Master Gain with smooth fade in
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, now);
    this.masterGain.gain.linearRampToValueAtTime(0.22, now + 1.2);

    // Routing
    this.source.connect(highpass);
    highpass.connect(lowpass);
    lowpass.connect(bandpass);
    bandpass.connect(this.masterGain);
    this.masterGain.connect(ctx.destination);

    this.source.start(now);
    this.lfo.start(now);
    this.isRunning = true;
  }

  stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.linearRampToValueAtTime(0.0001, now + 1.0);

    setTimeout(() => {
      try {
        this.source?.stop();
        this.lfo?.stop();
        this.source?.disconnect();
        this.lfo?.disconnect();
      } catch {
        // Safe teardown
      }
      this.isRunning = false;
    }, 1050);
  }

  toggle(): boolean {
    if (this.isRunning) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  get isActive(): boolean {
    return this.isRunning;
  }
}

export class RadioPlayer {
  private currentStationIndex = 0;
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private isTuning = false;
  private isHearted = false;

  private ambientSynth = new AmbientSynthesizer();

  private playBtn: HTMLElement | null = null;
  private prevBtn: HTMLElement | null = null;
  private nextBtn: HTMLElement | null = null;
  private heartBtn: HTMLElement | null = null;
  private ambientBtn: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;
  private statusDot: HTMLElement | null = null;
  private stationText: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;

  init() {
    this.playBtn = document.getElementById('radio-play-btn');
    this.prevBtn = document.getElementById('radio-prev-btn');
    this.nextBtn = document.getElementById('radio-next-btn');
    this.heartBtn = document.getElementById('radio-heart-btn');
    this.ambientBtn = document.getElementById('radio-ambient-btn');
    this.statusText = document.getElementById('radio-status-text');
    this.statusDot = document.getElementById('radio-status-dot');
    this.stationText = document.getElementById('radio-station-text');
    this.progressBar = document.getElementById('radio-progress-fill');

    this.playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.togglePlay();
    });

    this.prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.prevStation();
    });

    this.nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.nextStation();
    });

    this.heartBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleHeart();
    });

    this.ambientBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAmbient();
    });

    this.updateUI();
  }

  togglePlay() {
    if (this.isPlaying || this.isTuning) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'none';

      this.audio.addEventListener('playing', () => {
        this.isPlaying = true;
        this.isTuning = false;
        this.updateUI();
      });

      this.audio.addEventListener('waiting', () => {
        this.isTuning = true;
        this.updateUI();
      });

      this.audio.addEventListener('error', () => {
        this.isPlaying = false;
        this.isTuning = false;
        if (this.statusText) this.statusText.textContent = 'OFFLINE';
        this.updateUI();
      });
    }

    const station = STATIONS[this.currentStationIndex];
    this.audio.src = station.url;
    this.isTuning = true;
    this.updateUI();

    this.audio.play().catch(() => {
      this.isPlaying = false;
      this.isTuning = false;
      if (this.statusText) this.statusText.textContent = 'OFFLINE';
      this.updateUI();
    });
  }

  stop() {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
    }
    this.isPlaying = false;
    this.isTuning = false;
    this.updateUI();
  }

  nextStation() {
    this.currentStationIndex = (this.currentStationIndex + 1) % STATIONS.length;
    const wasPlaying = this.isPlaying || this.isTuning;
    this.stop();
    if (wasPlaying) {
      this.play();
    } else {
      this.updateUI();
    }
  }

  prevStation() {
    this.currentStationIndex = (this.currentStationIndex - 1 + STATIONS.length) % STATIONS.length;
    const wasPlaying = this.isPlaying || this.isTuning;
    this.stop();
    if (wasPlaying) {
      this.play();
    } else {
      this.updateUI();
    }
  }

  toggleHeart() {
    this.isHearted = !this.isHearted;
    if (this.heartBtn) {
      if (this.isHearted) {
        this.heartBtn.classList.add('hearted');
      } else {
        this.heartBtn.classList.remove('hearted');
      }
    }
  }

  toggleAmbient() {
    const active = this.ambientSynth.toggle();
    if (this.ambientBtn) {
      if (active) {
        this.ambientBtn.classList.add('active');
        this.ambientBtn.setAttribute('aria-pressed', 'true');
        this.ambientBtn.setAttribute('title', 'Ambient Wind: ON (click to mute)');
      } else {
        this.ambientBtn.classList.remove('active');
        this.ambientBtn.setAttribute('aria-pressed', 'false');
        this.ambientBtn.setAttribute('title', 'Ambient Wind: OFF (click to listen)');
      }
    }
  }

  private updateUI() {
    const station = STATIONS[this.currentStationIndex];
    if (this.stationText) {
      this.stationText.textContent = station.name;
    }

    if (this.statusText) {
      if (this.isPlaying) {
        this.statusText.textContent = 'LIVE';
      } else if (this.isTuning) {
        this.statusText.textContent = 'TUNING…';
      } else {
        this.statusText.textContent = 'LIVE';
      }
    }

    if (this.statusDot) {
      if (this.isPlaying) {
        this.statusDot.classList.add('playing');
      } else {
        this.statusDot.classList.remove('playing');
      }
    }

    if (this.progressBar) {
      if (this.isPlaying) {
        this.progressBar.classList.add('playing');
      } else {
        this.progressBar.classList.remove('playing');
      }
    }

    if (this.playBtn) {
      if (this.isPlaying) {
        this.playBtn.classList.add('playing');
        this.playBtn.innerHTML = `
          <div class="pause-bars">
            <span class="pause-bar"></span>
            <span class="pause-bar"></span>
          </div>
        `;
      } else {
        this.playBtn.classList.remove('playing');
        this.playBtn.innerHTML = `
          <svg viewBox="0 0 24 24" class="play-icon" fill="currentColor">
            <polygon points="7,4 20,12 7,20" />
          </svg>
        `;
      }
    }
  }
}
