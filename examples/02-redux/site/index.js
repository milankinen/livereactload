import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import App from '../src/containers/app';
import configureStore from '../src/store/configure-store';

const store = configureStore();

render(
  <Provider store={store}>
    <App/>
  </Provider>,
  global.document.getElementById('mountPoint')
);
