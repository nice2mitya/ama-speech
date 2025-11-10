import { useEffect, useRef } from 'react';
import { ConversationItem } from '../types/conversation';
import { MessageSquare, Bot, Loader2, AlertCircle } from 'lucide-react';

interface ConversationFeedProps {
  items: ConversationItem[];
  currentTranscription: string;
}

export function ConversationFeed({ items, currentTranscription }: ConversationFeedProps) {
  const feedEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items, currentTranscription]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      {items.map((item) => (
        <div key={item.id} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-800">{item.question}</p>
                <span className="text-xs text-gray-400 mt-2 block">
                  {new Date(item.timestamp).toLocaleTimeString('ru-RU')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Bot className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              {item.status === 'processing' && (
                <div className="bg-gray-50 rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Обрабатываю вопрос...</span>
                  </div>
                </div>
              )}

              {item.status === 'error' && (
                <div className="bg-red-50 rounded-lg shadow-sm p-4">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span>{item.error || 'Произошла ошибка'}</span>
                  </div>
                </div>
              )}

              {item.status === 'completed' && item.answer && (
                <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
                  <p className="text-gray-800">{item.answer}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {currentTranscription && (
        <div className="flex gap-3 opacity-60">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-4 border-2 border-blue-200">
              <p className="text-gray-600 italic">{currentTranscription}</p>
              <span className="text-xs text-blue-500 mt-2 block">Слушаю...</span>
            </div>
          </div>
        </div>
      )}

      <div ref={feedEndRef} />
    </div>
  );
}
