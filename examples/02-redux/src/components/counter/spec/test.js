import test from 'ava';
import sinon from 'sinon';
import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-addons-test-utils';
import jsdomReact from '../../../test/jsdom-react';
import Counter from '..';

function setup() {
  const actions = {
    increment: sinon.spy(),
    incrementIfOdd: sinon.spy(),
    incrementAsync: sinon.spy(),
    decrement: sinon.spy()
  };
  const component = TestUtils.renderIntoDocument(<Counter counter={1} {...actions}/>);
  return {
    component: component,
    actions: actions,
    buttons: TestUtils.scryRenderedDOMComponentsWithTag(component, 'button').map(button => {
      return ReactDOM.findDOMNode(button);
    }),
    p: ReactDOM.findDOMNode(TestUtils.findRenderedDOMComponentWithTag(component, 'p'))
  };
}

jsdomReact();

test('should display count', t => {
  const {p} = setup();
  let passed = false;
  if (p.textContent.match(/^Clicked: 1 times/)) {
    passed = true;
  }
  t.true(passed);
});

test('first button should call increment', t => {
  const {buttons, actions} = setup();
  TestUtils.Simulate.click(buttons[0]);
  t.true(actions.increment.called);
});

test('second button should call decrement', t => {
  const {buttons, actions} = setup();
  TestUtils.Simulate.click(buttons[1]);
  t.true(actions.decrement.called);
});

test('third button should call incrementIfOdd', t => {
  const {buttons, actions} = setup();
  TestUtils.Simulate.click(buttons[2]);
  t.true(actions.incrementIfOdd.called);
});

test('fourth button should call incrementAsync', t => {
  const {buttons, actions} = setup();
  TestUtils.Simulate.click(buttons[3]);
  t.true(actions.incrementAsync.called);
});
