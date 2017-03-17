import test from 'ava';

import counter from '../counter';
import {INCREMENT_COUNTER, DECREMENT_COUNTER} from '../../actions/counter';

test('should handle initial state', t => {
  t.is(counter(undefined, {}), 0);
});

test('should handle INCREMENT_COUNTER', t => {
  t.is(counter(1, {type: INCREMENT_COUNTER}), 2);
});

test('should handle DECREMENT_COUNTER', t => {
  t.is(counter(1, {type: DECREMENT_COUNTER}), 0);
});

test('should handle unknown action type', t => {
  t.is(counter(1, {type: 'unknown'}), 1);
});
