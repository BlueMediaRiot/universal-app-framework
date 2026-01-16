import { create } from 'zustand';

export interface Asset {
    id: string;
    name: string;
    url: string;
    type: 'video' | 'image' | 'audio';
    duration: number; // in seconds
}

export interface Clip {
    id: string;
    assetId: string;
    start: number; // start time in timeline (seconds)
    duration: number; // duration of clip (seconds)
    offset: number; // start time in original asset (seconds)
    trackId: string;
}

export interface Track {
    id: string;
    name: string;
    clips: Clip[];
}

export interface EditorState {
    assets: Asset[];
    tracks: Track[];
    currentTime: number;
    isPlaying: boolean;

    // Actions
    addAsset: (asset: Asset) => void;
    addTrack: () => void;
    addClip: (trackId: string, clip: Clip) => void;
    setPlaying: (playing: boolean) => void;
    setCurrentTime: (time: number) => void;
}

export const useStore = create<EditorState>((set) => ({
    assets: [],
    tracks: [
        { id: 'track-1', name: 'Video Track 1', clips: [] },
        { id: 'track-2', name: 'Audio Track 1', clips: [] }
    ],
    currentTime: 0,
    isPlaying: false,

    addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
    addTrack: () => set((state) => ({
        tracks: [...state.tracks, { id: `track-${Date.now()}`, name: 'New Track', clips: [] }]
    })),
    addClip: (trackId, clip) => set((state) => ({
        tracks: state.tracks.map(t =>
            t.id === trackId ? { ...t, clips: [...t.clips, clip] } : t
        )
    })),
    setPlaying: (playing) => set({ isPlaying: playing }),
    setCurrentTime: (time) => set({ currentTime: time }),
}));
