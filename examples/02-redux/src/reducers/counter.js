/**
 * @module reducers/counter
 */

import {INCREMENT_COUNTER, DECREMENT_COUNTER} from '../actions/counter';

/**
 * reducer for the counter
 * @param  {number} state  input state
 * @param  {object} action object containing the action type
 * @param  {string} action.type action type
 * @return {number}
 */
function counter(state = 0, action = {}) {
  switch (action.type) {
    case INCREMENT_COUNTER:
      return state + 1;
    case DECREMENT_COUNTER:
      return state - 1;
    default:
      return state;
  }
}

export default counter;
