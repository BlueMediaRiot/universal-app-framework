import { describe, it } from 'node:test';
import * as assert from 'node:assert';
import { useStore, Asset } from '../packages/cores/core-video-editor/src/index';

describe('Video Editor Core', () => {
    it('should initialize with default state', () => {
        const state = useStore.getState();
        assert.strictEqual(state.assets.length, 0);
        assert.ok(state.tracks.length >= 2);
        assert.strictEqual(state.currentTime, 0);
        assert.strictEqual(state.isPlaying, false);
    });

    it('should add assets', () => {
        const asset: Asset = {
            id: 'test-1',
            name: 'Test Video',
            url: 'http://test.com/video.mp4',
            type: 'video',
            duration: 10
        };

        useStore.getState().addAsset(asset);

        const state = useStore.getState();
        assert.strictEqual(state.assets.length, 1);
        assert.deepStrictEqual(state.assets[0], asset);
    });

    it('should add tracks', () => {
        const initialCount = useStore.getState().tracks.length;
        useStore.getState().addTrack();

        const state = useStore.getState();
        assert.strictEqual(state.tracks.length, initialCount + 1);
    });

    it('should update playback state', () => {
        useStore.getState().setPlaying(true);
        assert.strictEqual(useStore.getState().isPlaying, true);

        useStore.getState().setPlaying(false);
        assert.strictEqual(useStore.getState().isPlaying, false);
    });

    it('should update current time', () => {
        useStore.getState().setCurrentTime(5.5);
        assert.strictEqual(useStore.getState().currentTime, 5.5);
    });
});
