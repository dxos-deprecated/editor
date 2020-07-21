//
// Copyright 2020 DXOS.org
//

const createReactElementNodeView = (type = 'block', { onReactElementDomCreated }) => {
  return function (node) {
    const { attrs: { props = {}, className = '' } } = node;

    const dom = window.document.createElement(`${type}reactelement`);

    const nodeView = {
      dom,
      stopEvent (event) { return true; },
      ignoreMutation () { return true; },
      update (updatedNode) {
        if (!updatedNode.sameMarkup(node)) return false;
        return true;
      },
      selectNode () {
        const content = dom.querySelector('.react-element-content');
        if (!content) return;
        content.classList.add('selected');
      },
      deselectNode () {
        const content = dom.querySelector('.react-element-content');
        if (!content) return;
        content.classList.remove('selected');
      }
    };

    dom.setAttribute('props', encodeURI(JSON.stringify(props)));
    dom.className = className;

    onReactElementDomCreated(props, dom);

    return nodeView;
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

export const buildProsemirrorNodeViews = (options, schema) => {
  const nodeViews = {};

  if (schema.nodes.block_react_element) {
    nodeViews.block_react_element = createReactElementNodeView('block', options);
  }

  if (schema.nodes.inline_react_element) {
    nodeViews.inline_react_element = createReactElementNodeView('inline', options);
  }

  if (schema.marks.link) {
    nodeViews.link = linkNodeView(options);
  }

  return nodeViews;
};
