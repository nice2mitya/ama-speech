import { useState, useRef } from 'react';
import { ConversationFeed } from './components/ConversationFeed';
import { ControlPanel } from './components/ControlPanel';
import { AudioCaptureService, AudioSegment } from './services/audioCapture';
import { AudioEncoder } from './services/audioEncoder';
import { N8nWebhookService } from './services/n8nWebhook';
import { ConversationItem, RecordingState } from './types/conversation';

function App() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentTranscription, setCurrentTranscription] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);

  const audioCaptureRef = useRef<AudioCaptureService | null>(null);
  const n8nServiceRef = useRef<N8nWebhookService>(
    new N8nWebhookService('https://genproducer.app.n8n.cloud/webhook/AMA-SPEECH')
  );

  const handleSpeechStart = () => {
    setRecordingState('speaking');
    setCurrentTranscription('Говорите...');
  };

  const handleSpeechEnd = async (segment: AudioSegment) => {
    setRecordingState('processing');
    setCurrentTranscription('');

    const audioContext = audioCaptureRef.current?.getAudioContext();
    if (!audioContext) {
      console.error('Audio context not available');
      return;
    }

    try {
      const wavBlob = AudioEncoder.encodeToWav(segment.audioData, audioContext.sampleRate);
      const audioBase64 = await AudioEncoder.blobToBase64(wavBlob);

      const conversationId = `${Date.now()}-${Math.random()}`;
      const newItem: ConversationItem = {
        id: conversationId,
        question: 'Распознаю...',
        answer: '',
        timestamp: segment.timestamp,
        status: 'processing',
      };

      setConversations((prev) => [...prev, newItem]);

      if (!n8nServiceRef.current) {
        throw new Error('N8n webhook не настроен. Откройте настройки.');
      }

      const response = await n8nServiceRef.current.sendAudio({
        audioBase64,
        format: 'wav',
        timestamp: segment.timestamp,
        duration: segment.duration,
      });

      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversationId
            ? {
                ...item,
                question: response.transcribedText || 'Не удалось распознать',
                answer: response.answer || '',
                status: 'completed',
              }
            : item
        )
      );

      setRecordingState('listening');
    } catch (error) {
      console.error('Error processing speech:', error);

      setConversations((prev) =>
        prev.map((item) =>
          item.id === conversationId || item.question === 'Распознаю...'
            ? {
                ...item,
                question: item.question === 'Распознаю...' ? 'Ошибка' : item.question,
                status: 'error',
                error: error instanceof Error ? error.message : 'Неизвестная ошибка',
              }
            : item
        )
      );

      setRecordingState('listening');
    }
  };

  const handleAudioLevel = (level: number) => {
    setAudioLevel(level);
  };

  const handleError = (error: Error) => {
    console.error('Audio capture error:', error);
    alert(`Ошибка: ${error.message}`);
    setRecordingState('idle');
  };

  const toggleRecording = async () => {
    if (recordingState === 'idle') {
      try {
        audioCaptureRef.current = new AudioCaptureService({
          onSpeechStart: handleSpeechStart,
          onSpeechEnd: handleSpeechEnd,
          onAudioLevel: handleAudioLevel,
          onError: handleError,
        });

        await audioCaptureRef.current.start();
        setRecordingState('listening');
      } catch (error) {
        console.error('Failed to start recording:', error);
        alert('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
      }
    } else {
      if (audioCaptureRef.current) {
        await audioCaptureRef.current.stop();
        audioCaptureRef.current = null;
      }
      setRecordingState('idle');
      setAudioLevel(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AMA Консьерж</h1>
          <p className="text-sm text-gray-600 mt-1">
            Голосовой помощник с распознаванием русской речи
          </p>
        </div>
      </header>

      <ConversationFeed items={conversations} currentTranscription={currentTranscription} />

      <ControlPanel
        recordingState={recordingState}
        audioLevel={audioLevel}
        onToggleRecording={toggleRecording}
      />
    </div>
  );
}

export default App;
