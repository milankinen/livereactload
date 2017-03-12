import test from 'ava';
import sinon from 'sinon';
import * as actions from '../counter';

test('increment should create increment action', t => {
  const {stringify} = JSON;
  const passed = stringify(actions.increment()) === stringify({type: actions.INCREMENT_COUNTER});
  t.true(passed);
});

test('decrement should create decrement action', t => {
  const {stringify} = JSON;
  const passed = stringify(actions.decrement()) === stringify({type: actions.DECREMENT_COUNTER});
  t.true(passed);
});

test('incrementIfOdd should create increment action', t => {
  const fn = actions.incrementIfOdd();
  /* istanbul ignore if */
  if (typeof fn !== 'function') {
    t.fail();
  }
  const dispatch = sinon.spy();
  const getState = () => ({counter: 1});
  fn(dispatch, getState);
  t.true(dispatch.calledWith({type: actions.INCREMENT_COUNTER}));
});

test('incrementIfOdd shouldnt create increment action if counter is even', t => {
  const fn = actions.incrementIfOdd();
  const dispatch = sinon.spy();
  const getState = () => ({counter: 2});
  fn(dispatch, getState);
  t.true(dispatch.callCount === 0);
});

test('incrementAsync', t => {
  const fn = actions.incrementAsync(1);
  /* istanbul ignore if */
  if (typeof fn !== 'function') {
    t.fail();
  }
  const dispatch = sinon.spy();
  fn(dispatch);
  setTimeout(() => {
    t.true(dispatch.calledWith({type: actions.INCREMENT_COUNTER}));
  }, 5);
});
