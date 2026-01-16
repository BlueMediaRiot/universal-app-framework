import { useRef } from 'react';
import { Upload, FileVideo, Music, Image as ImageIcon } from 'lucide-react';
import { useStore } from '@universal-app/core-video-editor';

export function AssetLibrary() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { assets, addAsset } = useStore();

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        const type = file.type.startsWith('video/')
            ? 'video'
            : file.type.startsWith('audio/')
                ? 'audio'
                : 'image';

        // Basic duration fetching for video
        // In a real app, we'd use a more robust Metadata extractor
        let duration = 5; // Default 5s for images
        if (type === 'video' || type === 'audio') {
            const el = document.createElement(type === 'video' ? 'video' : 'audio');
            el.src = url;
            el.onloadedmetadata = () => {
                duration = el.duration;
                addAsset({
                    id: crypto.randomUUID(),
                    name: file.name,
                    url,
                    type: type as 'video' | 'audio' | 'image',
                    duration
                });
            };
        } else {
            addAsset({
                id: crypto.randomUUID(),
                name: file.name,
                url,
                type: 'image',
                duration
            });
        }
    };

    return (
        <aside className="w-72 border-r border-neutral-800 bg-neutral-900 flex flex-col">
            <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
                <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Assets
                </h2>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2 py-1 rounded transition-colors"
                >
                    Add Asset
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="video/*,image/*,audio/*"
                    onChange={handleFileUpload}
                />
            </div>
            <div className="flex-1 p-4 grid grid-cols-2 gap-2 content-start overflow-y-auto">
                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        className="aspect-video bg-neutral-800 rounded-md border border-neutral-700 flex flex-col items-center justify-center text-neutral-500 relative group cursor-pointer hover:border-blue-500 overflow-hidden"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData('application/json', JSON.stringify(asset));
                        }}
                    >
                        {asset.type === 'video' || asset.type === 'image' ? (
                            <img src={asset.url} className="w-full h-full object-cover" alt={asset.name} />
                        ) : (
                            <Music className="w-8 h-8" />
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-xs text-white truncate max-w-[90%] px-1">{asset.name}</span>
                        </div>
                        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-black/70 rounded text-[10px] text-white">
                            {asset.type === 'video' && <FileVideo className="w-3 h-3 inline mr-1" />}
                            {asset.type === 'image' && <ImageIcon className="w-3 h-3 inline mr-1" />}
                            {Math.floor(asset.duration)}s
                        </div>
                    </div>
                ))}
                {assets.length === 0 && (
                    <div className="col-span-2 py-8 text-center text-neutral-600 text-xs italic">
                        No assets. Click 'Add Asset' to import.
                    </div>
                )}
            </div>
        </aside>
    );
}
