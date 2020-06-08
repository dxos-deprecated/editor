//
// Copyright 2020 Wireline, Inc.
//

const reactElementNodeView = ({ onReactElementDomCreated }) => {
  return node => {
    const { attrs: { props = {} } } = node;

    const dom = window.document.createElement('reactelement');

    dom.setAttribute('props', encodeURI(JSON.stringify(props)));

    onReactElementDomCreated(dom, props);

    return {
      dom
    };
  };
};

const linkNodeView = () => {
  return node => {
    const { href, title } = node.attrs;
    const dom = window.document.createElement('a');

    dom.setAttribute('href', href);
    dom.setAttribute('title', `${title || href}\nCtrl + click to follow`);

    dom.onclick = event => {
      if (event.ctrlKey) {
        window.open(event.currentTarget.href, '_blank');
      }
    };

    dom.onmouseover = event => {
      if (event.ctrlKey) {
        dom.classList.add('hovered');
      }
    };

    dom.onkeydown = event => {
      if (event.ctrlKey) {
        dom.classList.add('hovered');
      }
    };

    dom.onkeyup = event => {
      if (!event.ctrlKey) {
        dom.classList.remove('hovered');
      }
    };

    dom.onmouseleave = () => dom.classList.remove('hovered');

    return {
      dom
    };
  };
};

export const buildNodeViews = (options, schema) => {
  const nodeViews = {};

  if (schema.nodes.react_element) {
    nodeViews.react_element = reactElementNodeView(options);
  }

  if (schema.marks.link) {
    nodeViews.link = linkNodeView(options);
  }

  return nodeViews;
};
