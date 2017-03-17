import React, {Component, PropTypes} from 'react';

/**
 * Counter component. renders a counter with buttons
 */
class Counter extends Component {
  /**
   * renders the component
   * @return {function}
   */
  render() {
    const {increment, incrementIfOdd, incrementAsync, decrement, counter} = this.props;
    const handleIncrementAsync = () => incrementAsync();
    return (
      <p>
        Clicked: {counter} times
        {' '}
        <button onClick={increment}>+</button>
        {' '}
        <button onClick={decrement}>-</button>
        {' '}
        <button onClick={incrementIfOdd}>Increment if odd</button>
        {' '}
        <button onClick={handleIncrementAsync}>Increment async</button>
      </p>
    );
  }
}

Counter.propTypes = {
  increment: PropTypes.func.isRequired,
  incrementIfOdd: PropTypes.func.isRequired,
  incrementAsync: PropTypes.func.isRequired,
  decrement: PropTypes.func.isRequired,
  counter: PropTypes.number.isRequired
};

export default Counter;
