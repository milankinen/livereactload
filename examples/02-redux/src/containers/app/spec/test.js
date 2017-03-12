import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import jsdomReact from '../../../test/jsdom-react';

import {Provider} from 'react-redux';
import App from '..';
import configureStore from '../../../store/configure-store';

function setup(initialState) {
  const store = configureStore(initialState);
  const app = TestUtils.renderIntoDocument(
    <Provider store={store}>
      <App/>
    </Provider>
  );
  return {
    app: app,
    buttons: TestUtils.scryRenderedDOMComponentsWithTag(app, 'button').map(button => {
      return ReactDOM.findDOMNode(button);
    }),
    p: ReactDOM.findDOMNode(TestUtils.findRenderedDOMComponentWithTag(app, 'p'))
  };
}

jsdomReact();

test('should display initial count', t => {
  const {p} = setup();
  let passed = false;
  if (p.textContent.match(/^Clicked: 0 times/)) {
    passed = true;
  }
  t.true(passed);
});

test('should display updated count after increment button click', t => {
  const {buttons, p} = setup();
  TestUtils.Simulate.click(buttons[0]);
  let passed = false;
  if (p.textContent.match(/^Clicked: 1 times/)) {
    passed = true;
  }
  t.true(passed);
});

test('should display updated count after decrement button click', t => {
  const {buttons, p} = setup();
  TestUtils.Simulate.click(buttons[1]);
  let passed = false;
  if (p.textContent.match(/^Clicked: -1 times/)) {
    passed = true;
  }
  t.true(passed);
});

test('shouldnt change if even and if odd button clicked', t => {
  const {buttons, p} = setup();
  TestUtils.Simulate.click(buttons[2]);
  let passed = false;
  if (p.textContent.match(/^Clicked: 0 times/)) {
    passed = true;
  }
  t.true(passed);
});

test('should change if odd and if odd button clicked', t => {
  const {buttons, p} = setup({counter: 1});
  TestUtils.Simulate.click(buttons[2]);
  let passed = false;
  if (p.textContent.match(/^Clicked: 2 times/)) {
    passed = true;
  }
  t.true(passed);
});
