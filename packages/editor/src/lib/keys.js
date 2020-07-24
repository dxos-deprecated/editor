//
// Copyright 2020 DXOS.org
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

export const isCharKeyCode = keycode => {
  return (
    // number keys
    (keycode > 47 && keycode < 58) ||
    // spacebar
    // keycode === 32 ||
    // letter keys
    (keycode > 64 && keycode < 91) ||
    // numpad keys
    (keycode > 95 && keycode < 112) ||
    // ;=,-./` (in order)
    (keycode > 185 && keycode < 193) ||
    // [\]' (in order)
    (keycode > 218 && keycode < 223)
  );
};

export const isComposedKeyCode = keyCode => {
  return (keyCode === 17 || keyCode === 18 || keyCode === 16);
};
