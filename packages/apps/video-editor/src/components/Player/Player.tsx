import { useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { useStore } from '@universal-app/core-video-editor';



export function Player() {
    const { isPlaying, setPlaying, currentTime, setCurrentTime, tracks, assets } = useStore();
    const videoRef = useRef<HTMLVideoElement>(null);
    const animationFrameRef = useRef<number>(0);
    // Removed unused activeClip ref logic

    // Find active clip at current time
    // For MVP: Prioritize top track or first track with content
    const getActiveClipAtTime = (time: number) => {
        for (const track of tracks) {
            const clip = track.clips.find(c => time >= c.start && time < c.start + c.duration);
            if (clip) {
                const asset = assets.find(a => a.id === clip.assetId);
                if (asset && asset.type === 'video') {
                    return { clip, asset };
                }
            }
        }
        return null;
    };

    const currentClipData = getActiveClipAtTime(currentTime);

    // Sync video source
    useEffect(() => {
        if (!videoRef.current) return;

        if (currentClipData) {
            // If src changed
            if (videoRef.current.src !== currentClipData.asset.url) {
                videoRef.current.src = currentClipData.asset.url;
            }

            // Sync time (video time = timeline time - clip start + clip offset)
            // Only seek if significantly off to prevent jitter
            const targetDescTime = currentTime - currentClipData.clip.start + currentClipData.clip.offset;
            if (Math.abs(videoRef.current.currentTime - targetDescTime) > 0.5) {
                videoRef.current.currentTime = targetDescTime;
            }

            if (isPlaying) {
                videoRef.current.play().catch(() => { });
            } else {
                videoRef.current.pause();
            }

        } else {
            // No clip, show blank or pause
            videoRef.current.src = "";
        }
    }, [currentClipData?.asset.url, currentClipData?.clip.id]);
    // Dependency on ID ensures selection changes update, but managing time needs care.
    // Actually, continuously updating currentTime while playing logic needs to be separate.

    // Playback Loop
    useEffect(() => {
        if (isPlaying) {
            let lastTime = performance.now();

            const loop = (now: number) => {
                const delta = (now - lastTime) / 1000;
                lastTime = now;

                // Update store time
                setCurrentTime(useStore.getState().currentTime + delta);

                animationFrameRef.current = requestAnimationFrame(loop);
            };

            animationFrameRef.current = requestAnimationFrame(loop);
            // Ensure video is playing
            if (videoRef.current && currentClipData && videoRef.current.paused) {
                videoRef.current.play().catch(() => { });
            }
        } else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            videoRef.current?.pause();
        }

        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, setCurrentTime]); // Don't depend on currentClipData here, just time loop

    // Sync video time to store time continuously if not playing (scrubbing)
    useEffect(() => {
        if (!isPlaying && videoRef.current && currentClipData) {
            const targetTime = currentTime - currentClipData.clip.start + currentClipData.clip.offset;
            if (Math.abs(videoRef.current.currentTime - targetTime) > 0.1) {
                videoRef.current.currentTime = targetTime;
            }
        }
    }, [currentTime, isPlaying, currentClipData]);

    const togglePlay = () => setPlaying(!isPlaying);

    return (
        <div className="flex-1 bg-neutral-950 flex flex-col items-center justify-center p-8 relative">
            {/* Video Container */}
            <div className="aspect-video w-full max-w-4xl bg-black rounded-lg shadow-2xl border border-neutral-800 flex items-center justify-center overflow-hidden relative">
                {currentClipData ? (
                    <video
                        ref={videoRef}
                        className="w-full h-full object-contain"
                        muted={false} // Allow audio
                        playsInline
                    />
                ) : (
                    <div className="text-neutral-700 flex flex-col items-center">
                        <span className="text-4xl font-bold mb-2">NO SIGNAL</span>
                        <span className="text-sm uppercase tracking-widest">Add video to timeline</span>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center gap-4 bg-neutral-900/80 p-2 rounded-full border border-neutral-800 backdrop-blur">
                <button onClick={() => setCurrentTime(0)} className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-full transition-colors">
                    <SkipBack className="w-4 h-4" />
                </button>
                <button
                    onClick={togglePlay}
                    className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:bg-neutral-200 transition-colors"
                >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </button>
                <button className="text-neutral-400 hover:text-white p-2 hover:bg-neutral-800 rounded-full transition-colors">
                    <SkipForward className="w-4 h-4" />
                </button>
                <div className="w-px h-4 bg-neutral-800 mx-2" />
                <span className="text-xs font-mono text-neutral-400 min-w-[60px] text-center">
                    {new Date(currentTime * 1000).toISOString().substr(14, 5)}
                </span>
            </div>
        </div>
    );
}
