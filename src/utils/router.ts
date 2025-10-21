// Simple hash-based router for campaign navigation
export type Route = {
  path: 'home' | 'campaign';
  slug?: string;
  mode?: 'view' | 'edit';
};

export const router = {
  // Navigate to a route
  navigate(route: Route) {
    if (route.path === 'home') {
      window.location.hash = '';
    } else if (route.path === 'campaign' && route.slug) {
      const mode = route.mode === 'edit' ? '/edit' : '';
      window.location.hash = `campanha/${route.slug}${mode}`;
    }
  },

  // Get current route
  getCurrentRoute(): Route {
    const hash = window.location.hash.slice(1); // Remove #
    
    if (!hash) {
      return { path: 'home' };
    }

    // Match /campanha/{slug} or /campanha/{slug}/edit
    const campaignMatch = hash.match(/^campanha\/([^/]+)(\/edit)?$/);
    if (campaignMatch) {
      return {
        path: 'campaign',
        slug: campaignMatch[1],
        mode: campaignMatch[2] ? 'edit' : 'view',
      };
    }

    return { path: 'home' };
  },

  // Subscribe to route changes
  onRouteChange(callback: (route: Route) => void) {
    const handler = () => {
      callback(this.getCurrentRoute());
    };
    
    window.addEventListener('hashchange', handler);
    
    // Return unsubscribe function
    return () => window.removeEventListener('hashchange', handler);
  },

  // Go back
  back() {
    window.history.back();
  },
};
