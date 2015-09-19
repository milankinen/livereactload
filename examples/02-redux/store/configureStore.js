import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import reducer from '../reducers';

const createStoreWithMiddleware = applyMiddleware(
  thunk
)(createStore);

export default function configureStore(initialState) {
  const store = createStoreWithMiddleware(reducer, initialState);

  // When using WebPack, module.hot.accept should be used. In
  // LiveReactload, same result can be achieved by using
  // module.onReload hook. This hook doesn't prevent reloading
  // propagation but at least it gives modules a change to react
  // to reloading events
  if (module.onReload) {
    module.onReload(() => {
      const nextReducer = require('../reducers');
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
