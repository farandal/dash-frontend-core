// Custom event system for nav state communication
export const NAV_EVENTS = {
  TOGGLE_EXPANDED: 'nav:toggle-expanded',
  SET_EXPANDED: 'nav:set-expanded',
  STATE_CHANGED: 'nav:state-changed'
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
