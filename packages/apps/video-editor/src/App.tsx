import { Video } from 'lucide-react';
import { AssetLibrary } from './components/AssetLibrary/AssetLibrary';
import { Timeline } from './components/Timeline/Timeline';
import { Player } from './components/Player/Player';

function App() {
  return (
    <div className="h-screen w-screen bg-neutral-900 text-white flex flex-col overflow-hidden font-sans">
      {/* Header */}
      <header className="h-14 border-b border-neutral-800 flex items-center px-4 justify-between bg-neutral-900/50 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">Antigravity Editor</span>
        </div>
        <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-sm font-medium rounded-md transition-colors">
          Export
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Asset Library (Left Sidebar) */}
        <AssetLibrary />

        {/* Center Implementation Region */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Preview Area */}
          <Player />

          {/* Timeline Area */}
          <Timeline />
        </div>
      </div>
    </div>
  )
}

export default App
