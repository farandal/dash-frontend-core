import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IMenuState {
  navExpanded: boolean;
}

// Initialize state from localStorage if available
const getInitialNavExpanded = (): boolean => {
  try {
    const savedState = localStorage.getItem('dashNavExpanded');
    return savedState !== null ? savedState === 'true' : true;
  } catch (e) {
    // Fallback in case localStorage is not available
    return true;
  }
};

const initialState: IMenuState = {
  navExpanded: getInitialNavExpanded()
};

// Helper function to save state to localStorage
const saveNavExpandedState = (state: boolean): void => {
  try {
    localStorage.setItem('dashNavExpanded', String(state));
    console.log( `Saved navigation state to localStorage: ${state}`)
  } catch (e) {
    console.error('Failed to save navigation state to localStorage:', e);
  }
};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    setNavExpanded(state, action: PayloadAction<boolean>) {
      state.navExpanded = action.payload;
      // Save to localStorage directly in the reducer
      saveNavExpandedState(action.payload);
    },
    toggleNavExpanded(state) {
      state.navExpanded = !state.navExpanded;
      // Save to localStorage directly in the reducer
      saveNavExpandedState(!state.navExpanded);
    }
  }
});

export const { setNavExpanded, toggleNavExpanded } = menuSlice.actions;
export default menuSlice.reducer;
