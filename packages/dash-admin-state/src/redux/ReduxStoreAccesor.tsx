// Create this new file to access the Redux store
let store: any = null;

export const setReduxStore = (reduxStore: any) => {
  store = reduxStore;
};

export const getReduxStore = () => {
  if (!store) {
    throw new Error('Redux store not initialized. Call setReduxStore first.');
  }
  return store;
};

export const dispatchToRedux = (action: any) => {
  const reduxStore = getReduxStore();
  return reduxStore.dispatch(action);
};
