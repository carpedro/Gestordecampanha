import { useState, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { router } from './utils/router';

// Import main app
import { CampaignsApp } from './components/CampaignsApp';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(router.getCurrentRoute());

  useEffect(() => {
    const unsubscribe = router.onRouteChange((route) => {
      setCurrentRoute(route);
    });
    return unsubscribe;
  }, []);

  // Check if we're on a campaign detail page
  const isDetailPage = currentRoute.path === 'campaign';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - only show if not on detail page */}
      {!isDetailPage && (
        <header className="bg-white border-b sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-base sm:text-lg">Campanhas EdTech</h1>
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <CampaignsApp />
      </div>

      <Toaster />
    </div>
  );
}
