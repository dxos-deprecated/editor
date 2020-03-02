//
// Copyright 2020 Wireline, Inc.
//

export const KEY_ARROW_UP = 'ArrowUp';
export const KEY_ARROW_DOWN = 'ArrowDown';
export const KEY_TAB = 'Tab';
export const KEY_ENTER = 'Enter';
export const KEY_ESCAPE = 'Escape';
export const KEY_SPACE = 'Space';
export const KEY_BACKSPACE = 'Backspace';

export const isKeyEventCombination = (keyConfig = {}, event) => {
  return Object.keys(keyConfig).every(key => keyConfig[key] === event[key]);
};