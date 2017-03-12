/**
 * @module actions/counter
 */

/**
 * @const
 * @type {String}
 */
export const INCREMENT_COUNTER = 'INCREMENT_COUNTER';
/**
 * @const
 * @type {String}
 */
export const DECREMENT_COUNTER = 'DECREMENT_COUNTER';

/**
 * incerement the counter
 * @return {object}
 */
export function increment() {
  return {
    type: INCREMENT_COUNTER
  };
}

/**
 * decrement the counter
 * @return {object}
 */
export function decrement() {
  return {
    type: DECREMENT_COUNTER
  };
}

/**
 * increment the counter if it is odd
 * @return {function}
 */
export function incrementIfOdd() {
  return (dispatch, getState) => {
    const {counter} = getState();

    if (counter % 2 === 0) {
      return;
    }

    dispatch(increment());
  };
}

/**
 * increment the counter async
 * @return {function}
 */
export function incrementAsync(delay = 1000) {
  return dispatch => {
    setTimeout(() => {
      dispatch(increment());
    }, delay);
  };
}
