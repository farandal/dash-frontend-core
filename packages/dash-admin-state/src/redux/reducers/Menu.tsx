import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// This reducer is now deprecated - nav functionality moved to Common reducer
// Keep this file for backward compatibility but redirect to common state

export interface IMenuState {
  // Empty - functionality moved to Common reducer
}

const initialState: IMenuState = {};

const menuSlice = createSlice({
  name: 'menu',
  initialState,
  reducers: {
    // Deprecated - use common reducer actions instead
    setNavExpanded(state, action: PayloadAction<boolean>) {
      console.warn('menu/setNavExpanded is deprecated. Use common reducer actions instead.');
    },
    toggleNavExpanded(state) {
      console.warn('menu/toggleNavExpanded is deprecated. Use common reducer actions instead.');
    }
  }
});

export const { setNavExpanded, toggleNavExpanded } = menuSlice.actions;
export default menuSlice.reducer;
