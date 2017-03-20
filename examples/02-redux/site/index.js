import React from 'react';
import {render} from 'react-dom';
import {Provider} from 'react-redux';
import {AppContainer} from 'react-hot-loader';
import App from '../src/containers/app';
import configureStore from '../src/store/configure-store';

const store = configureStore();

render(
  <AppContainer>
    <Provider store={store}>
      <App/>
    </Provider>
  </AppContainer>,
  global.document.getElementById('mountPoint')
);
