interface AudioVisualizerProps {
  audioLevel: number;
  isActive: boolean;
}

export function AudioVisualizer({ audioLevel, isActive }: AudioVisualizerProps) {
  const bars = 20;
  const activeBarCount = Math.floor(audioLevel * bars);

  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {Array.from({ length: bars }).map((_, index) => {
        const isActiveBar = index < activeBarCount && isActive;
        const height = isActiveBar
          ? `${20 + (audioLevel * 60)}%`
          : '20%';

        return (
          <div
            key={index}
            className={`w-1 rounded-full transition-all duration-150 ${
              isActiveBar
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
            style={{ height }}
          />
        );
      })}
    </div>
  );
}
