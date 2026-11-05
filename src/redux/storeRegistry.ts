let _store: any;

export const setStore = (store: any): void => {
  _store = store;
};

export const getStore = (): any => _store;

