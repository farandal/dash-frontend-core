// Custom event system for nav state communication
export const NAV_EVENTS = {
  TOGGLE_EXPANDED: 'nav:toggle-expanded',
  SET_EXPANDED: 'nav:set-expanded',
  STATE_CHANGED: 'nav:state-changed',
  CLOSE_DRAWER: 'nav:close-drawer',
  CLOSE_ALL_SUBMENUS: 'nav:close-all-submenus',
  SUBMENU_OPENED: 'nav:submenu-opened'
} as const;

export interface NavStateChangeEvent extends CustomEvent {
  detail: {
    expanded: boolean;
    size: 'small' | 'large';
  };
}

export class NavEventManager {
  static toggleExpanded() {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.TOGGLE_EXPANDED));
  }
  
  static setExpanded(expanded: boolean) {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.SET_EXPANDED, { 
      detail: { expanded } 
    }));
  }
  
  static notifyStateChange(expanded: boolean, size: 'small' | 'large') {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.STATE_CHANGED, {
      detail: { expanded, size }
    }));
  }

  // Close drawer (used when navigating on mobile)
  static closeDrawer() {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.CLOSE_DRAWER));
  }

  static onCloseDrawer(callback: () => void) {
    const handler = () => callback();
    window.addEventListener(NAV_EVENTS.CLOSE_DRAWER, handler);
    return () => window.removeEventListener(NAV_EVENTS.CLOSE_DRAWER, handler);
  }

  // Submenu accordion behavior - notify when a submenu opens
  static notifySubmenuOpened(submenuKey: string) {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.SUBMENU_OPENED, {
      detail: { submenuKey }
    }));
  }

  static onSubmenuOpened(callback: (submenuKey: string) => void) {
    const handler = (event: CustomEvent<{submenuKey: string}>) => {
      callback(event.detail.submenuKey);
    };
    window.addEventListener(NAV_EVENTS.SUBMENU_OPENED, handler as EventListener);
    return () => window.removeEventListener(NAV_EVENTS.SUBMENU_OPENED, handler as EventListener);
  }

  // Close all submenus
  static closeAllSubmenus() {
    window.dispatchEvent(new CustomEvent(NAV_EVENTS.CLOSE_ALL_SUBMENUS));
  }

  static onCloseAllSubmenus(callback: () => void) {
    const handler = () => callback();
    window.addEventListener(NAV_EVENTS.CLOSE_ALL_SUBMENUS, handler);
    return () => window.removeEventListener(NAV_EVENTS.CLOSE_ALL_SUBMENUS, handler);
  }
  
  static onToggleExpanded(callback: () => void) {
    const handler = () => callback();
    window.addEventListener(NAV_EVENTS.TOGGLE_EXPANDED, handler);
    return () => window.removeEventListener(NAV_EVENTS.TOGGLE_EXPANDED, handler);
  }
  
  static onSetExpanded(callback: (expanded: boolean) => void) {
    const handler = (event: CustomEvent) => callback(event.detail.expanded);
    window.addEventListener(NAV_EVENTS.SET_EXPANDED, handler as EventListener);
    return () => window.removeEventListener(NAV_EVENTS.SET_EXPANDED, handler as EventListener);
  }
  
  static onStateChange(callback: (expanded: boolean, size: 'small' | 'large') => void) {
    const handler = (event: CustomEvent<{expanded: boolean; size: 'small' | 'large'}>) => {
      callback(event.detail.expanded, event.detail.size);
    };
    window.addEventListener(NAV_EVENTS.STATE_CHANGED, handler as EventListener);
    return () => window.removeEventListener(NAV_EVENTS.STATE_CHANGED, handler as EventListener);
  }
}
