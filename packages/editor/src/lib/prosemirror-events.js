//
// Copyright 2020 DXOS.org
//

const linkCtrlHoverEvent = () => {
  return (view, event) => {
    // Handle link ctrl+click.
    if (
      event.target.nodeName === 'A' &&
      event.ctrlKey
    ) {
      event.target.classList.add('hovered');
      return true;
    }

    return false;
  };
};

export const buildProsemirrorEvents = (options, schema) => {
  const events = {
    handleKeyDown: options.onKeyDown ? (view, event) => options.onKeyDown(event) : undefined,
    handleDOMEvents: {
    },

    // Prevent select prosemirror nodes
    handleClick: (view, pos, event) => {
      return /Mac/.test(window.navigator.platform) ? event.metaKey : event.ctrlKey;
    }
  };

  if (schema.marks.link) {
    events.handleDOMEvents.mousemove = linkCtrlHoverEvent(options);
  }

  return events;
};
