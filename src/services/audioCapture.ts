export interface AudioSegment {
  audioData: Float32Array[];
  duration: number;
  timestamp: number;
}

export interface AudioCaptureEvents {
  onSpeechStart: () => void;
  onSpeechEnd: (segment: AudioSegment) => void;
  onAudioLevel: (level: number) => void;
  onError: (error: Error) => void;
}

export class AudioCaptureService {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private isRecording = false;
  private isSpeaking = false;
  private audioBuffer: Float32Array[] = [];
  private speechStartTime = 0;
  private silenceStartTime = 0;
  private silenceThreshold = 0.02;
  private silenceDuration = 1400;
  private minSpeechDuration = 400;
  private events: AudioCaptureEvents;
  private animationFrameId: number | null = null;

  constructor(events: AudioCaptureEvents) {
    this.events = events;
  }

  async start(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.scriptProcessor = this.audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(this.analyserNode);
      this.analyserNode.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.audioContext.destination);

      this.scriptProcessor.onaudioprocess = (event) => {
        this.processAudio(event);
      };

      this.isRecording = true;
      this.startAudioLevelMonitoring();
    } catch (error) {
      this.events.onError(error as Error);
      throw error;
    }
  }

  private processAudio(event: AudioProcessingEvent): void {
    if (!this.isRecording) return;

    const inputData = event.inputBuffer.getChannelData(0);
    const audioLevel = this.calculateAudioLevel(inputData);

    const isSpeech = audioLevel > this.silenceThreshold;
    const now = Date.now();

    if (isSpeech) {
      if (!this.isSpeaking) {
        this.isSpeaking = true;
        this.speechStartTime = now;
        this.audioBuffer = [];
        this.events.onSpeechStart();
      }

      this.audioBuffer.push(new Float32Array(inputData));
      this.silenceStartTime = 0;
    } else if (this.isSpeaking) {
      if (this.silenceStartTime === 0) {
        this.silenceStartTime = now;
      }

      const silenceDuration = now - this.silenceStartTime;
      const speechDuration = now - this.speechStartTime;

      if (
        silenceDuration >= this.silenceDuration &&
        speechDuration >= this.minSpeechDuration
      ) {
        this.endSpeech();
      } else {
        this.audioBuffer.push(new Float32Array(inputData));
      }
    }
  }

  private endSpeech(): void {
    if (!this.isSpeaking || this.audioBuffer.length === 0) return;

    const segment: AudioSegment = {
      audioData: this.audioBuffer,
      duration: Date.now() - this.speechStartTime,
      timestamp: this.speechStartTime,
    };

    this.isSpeaking = false;
    this.audioBuffer = [];
    this.silenceStartTime = 0;

    this.events.onSpeechEnd(segment);
  }

  private calculateAudioLevel(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  private startAudioLevelMonitoring(): void {
    if (!this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);

    const monitor = () => {
      if (!this.isRecording || !this.analyserNode) return;

      this.analyserNode.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      const normalizedLevel = average / 255;

      this.events.onAudioLevel(normalizedLevel);

      this.animationFrameId = requestAnimationFrame(monitor);
    };

    monitor();
  }

  async stop(): Promise<void> {
    this.isRecording = false;

    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.scriptProcessor) {
      this.scriptProcessor.disconnect();
      this.scriptProcessor = null;
    }

    if (this.analyserNode) {
      this.analyserNode.disconnect();
      this.analyserNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext) {
      await this.audioContext.close();
      this.audioContext = null;
    }
  }

  getAudioContext(): AudioContext | null {
    return this.audioContext;
  }
}
