import { BarChart3, LayoutDashboard, Trophy } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'ranking', label: 'Ranking', icon: Trophy },
];

export default function Layout({ activeView, onNavigate, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-enter-gray-950">
      {/* Sidebar */}
      <aside className="w-60 bg-enter-black flex flex-col flex-shrink-0 border-r border-enter-gray-800">
        {/* Logo */}
        <div className="p-5 border-b border-enter-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-enter-gold rounded-enter flex items-center justify-center">
              <BarChart3 className="w-4.5 h-4.5 text-enter-black" />
            </div>
            <div>
              <h1 className="text-base font-bold text-enter-white tracking-tight uppercase">Enter</h1>
              <p className="text-[10px] text-enter-gray-500 uppercase tracking-widest">Sales Intelligence</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-enter text-sm font-medium transition-colors cursor-pointer ${
                activeView === id
                  ? 'bg-enter-gold/10 text-enter-gold border border-enter-gold/20'
                  : 'text-enter-gray-400 hover:text-enter-white hover:bg-enter-gray-900 border border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-enter-gray-800">
          <p className="text-[10px] text-enter-gray-600 uppercase tracking-widest">Case Growth Summer 2026</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
