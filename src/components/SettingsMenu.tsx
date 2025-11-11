import { X, Settings } from 'lucide-react';
import { useState } from 'react';

export interface AudioConfig {
  voiceRatioThreshold: number;
  voiceLevelThreshold: number;
  noiseRatioThreshold: number;
  silenceDuration: number;
  minSpeechDuration: number;
}

interface SettingsMenuProps {
  config: AudioConfig;
  onConfigChange: (config: AudioConfig) => void;
}

export function SettingsMenu({ config, onConfigChange }: SettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (key: keyof AudioConfig, value: number) => {
    onConfigChange({ ...config, [key]: value });
  };

  const resetToDefaults = () => {
    onConfigChange({
      voiceRatioThreshold: 0.5,
      voiceLevelThreshold: 30,
      noiseRatioThreshold: 0.4,
      silenceDuration: 1400,
      minSpeechDuration: 400,
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-6 p-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200"
        title="Настройки чувствительности"
      >
        <Settings className="w-5 h-5 text-gray-600" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Настройки микрофона</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Порог голоса ({(config.voiceRatioThreshold * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.8"
                    step="0.05"
                    value={config.voiceRatioThreshold}
                    onChange={(e) => handleChange('voiceRatioThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Минимальная доля энергии в голосовом диапазоне
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Громкость голоса ({config.voiceLevelThreshold.toFixed(0)})
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    value={config.voiceLevelThreshold}
                    onChange={(e) => handleChange('voiceLevelThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Минимальный уровень громкости для активации
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Фильтр шума ({(config.noiseRatioThreshold * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0.2"
                    max="0.6"
                    step="0.05"
                    value={config.noiseRatioThreshold}
                    onChange={(e) => handleChange('noiseRatioThreshold', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Максимальная доля шума для активации
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Пауза для завершения ({(config.silenceDuration / 1000).toFixed(1)}с)
                  </label>
                  <input
                    type="range"
                    min="500"
                    max="3000"
                    step="100"
                    value={config.silenceDuration}
                    onChange={(e) => handleChange('silenceDuration', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Длительность тишины для завершения записи
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Минимальная длина ({(config.minSpeechDuration / 1000).toFixed(1)}с)
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="3000"
                    step="100"
                    value={config.minSpeechDuration}
                    onChange={(e) => handleChange('minSpeechDuration', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Минимальная длительность речи для отправки
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={resetToDefaults}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Сбросить
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Готово
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
