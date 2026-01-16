import { Layers, Plus } from 'lucide-react';
import { useStore } from '@universal-app/core-video-editor';
import type { Asset } from '@universal-app/core-video-editor';
import clsx from 'clsx';

export function Timeline() {
    const { tracks, addTrack, addClip, assets, currentTime } = useStore();

    // Timeline Zoom/Scale (pixels per second)
    const pxPerSec = 30;

    const handleDrop = (e: React.DragEvent, trackId: string) => {
        e.preventDefault();
        const assetData = e.dataTransfer.getData('application/json');
        if (!assetData) return;

        try {
            const asset: Asset = JSON.parse(assetData);

            // Determine start position based on drop X coordinate or append to end
            // For MVP, simple append or place at dropped time
            const rect = e.currentTarget.getBoundingClientRect();
            const relativeX = e.clientX - rect.left;
            const startTime = Math.max(0, relativeX / pxPerSec);

            addClip(trackId, {
                id: crypto.randomUUID(),
                assetId: asset.id,
                start: startTime,
                duration: asset.duration,
                offset: 0,
                trackId
            });
        } catch (err) {
            console.error('Failed to parse dropped asset', err);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="h-72 bg-neutral-900 border-t border-neutral-800 flex flex-col">
            <div className="h-10 border-b border-neutral-800 flex items-center px-4 gap-4 bg-neutral-900/50 justify-between">
                <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-neutral-400" />
                    <span className="text-xs text-neutral-500">Timeline</span>
                </div>
                <button
                    onClick={addTrack}
                    className="flex items-center gap-1 text-xs bg-neutral-800 hover:bg-neutral-700 px-2 py-1 rounded transition-colors"
                >
                    <Plus className="w-3 h-3" /> Add Track
                </button>
            </div>
            <div className="flex-1 relative overflow-x-auto overflow-y-auto p-4 custom-scrollbar">
                <div className="w-[2000px] space-y-2"> {/* Fixed large width for scrolling demo */}
                    {/* Playhead Marker */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                        style={{ left: `${currentTime * pxPerSec + 16}px` /* 16px padding */ }}
                    />

                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="relative h-16 bg-neutral-800/30 rounded border border-neutral-800 hover:bg-neutral-800/50 transition-colors"
                            onDrop={(e) => handleDrop(e, track.id)}
                            onDragOver={handleDragOver}
                        >
                            <div className="absolute left-2 top-2 text-[10px] text-neutral-500 pointer-events-none z-10 select-none">
                                {track.name}
                            </div>

                            {track.clips.map((clip) => {
                                const asset = assets.find(a => a.id === clip.assetId);
                                if (!asset) return null;

                                return (
                                    <div
                                        key={clip.id}
                                        className={clsx(
                                            "absolute top-1 bottom-1 rounded overflow-hidden border border-white/10 group cursor-move",
                                            asset.type === 'video' ? "bg-blue-900/60" :
                                                asset.type === 'image' ? "bg-purple-900/60" : "bg-emerald-900/60"
                                        )}
                                        style={{
                                            left: `${clip.start * pxPerSec}px`,
                                            width: `${clip.duration * pxPerSec}px`
                                        }}
                                        title={asset.name}
                                    >
                                        <div className="text-[10px] px-1 text-white/80 truncate">{asset.name}</div>
                                        {/* Thumbs generation could go here */}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
