import { useState, useMemo, useCallback } from 'react';
import debounce from 'lodash.debounce';

/**
 * The same thing as useState, except it will return an instantly
 * updated value and a value that is debounced by a delay.
 */
export const useDebouncedState = (initialState, delay = 200) => {
  const [actualState, setActualState] = useState(initialState);
  const [debouncedState, setDebouncedState] = useState(initialState);

  const debounceCommitState = useMemo(
    () =>
      debounce((value) => {
        setDebouncedState(value);
      }, delay),
    [delay],
  );

  const handleChangeState = useCallback(
    (value) => {
      setActualState(value);
      debounceCommitState(value);
    },
    [debounceCommitState],
  );

  return [[actualState, debouncedState], handleChangeState];
}

export const removeSpaces = (str) => {
  return str.replace(/\s+/g, '');
}

export const convertToKebabCase = (inputString) => {
  return inputString.replace(/([a-z0–9])([A-Z])/g, "$1-$2").toLowerCase();
}