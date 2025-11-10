import { Mic, MicOff } from 'lucide-react';
import { RecordingState } from '../types/conversation';
import { AudioVisualizer } from './AudioVisualizer';

interface ControlPanelProps {
  recordingState: RecordingState;
  audioLevel: number;
  onToggleRecording: () => void;
}

export function ControlPanel({
  recordingState,
  audioLevel,
  onToggleRecording,
}: ControlPanelProps) {
  const getStatusText = () => {
    switch (recordingState) {
      case 'idle':
        return 'Нажмите для начала';
      case 'listening':
        return 'Слушаю...';
      case 'speaking':
        return 'Говорите';
      case 'processing':
        return 'Обрабатываю...';
      default:
        return '';
    }
  };

  const getStatusColor = () => {
    switch (recordingState) {
      case 'speaking':
        return 'text-green-600';
      case 'listening':
        return 'text-blue-600';
      case 'processing':
        return 'text-orange-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <AudioVisualizer
          audioLevel={audioLevel}
          isActive={recordingState === 'listening' || recordingState === 'speaking'}
        />

        <div className="flex items-center justify-center">
          <div className="flex items-center gap-4">
            <button
              onClick={onToggleRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${
                recordingState === 'idle'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {recordingState === 'idle' ? (
                <Mic className="w-8 h-8" />
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>

            <div>
              <p className={`font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </p>
              {recordingState === 'speaking' && (
                <p className="text-sm text-gray-500">Пауза 1.4с = конец вопроса</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
