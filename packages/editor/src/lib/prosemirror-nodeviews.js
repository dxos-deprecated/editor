//
// Copyright 2020 DXOS.org
//

import ReactDOM from 'react-dom';
import React from 'react';
import { uuidv4 } from 'lib0/random';
import { NodeSelection } from 'prosemirror-state';

import ReactEmbededElement from '../components/ReactEmbededElement';

const reactElementNodeView = ({ onReactElementDomCreated }) => {
  return function (node) {
    const { attrs: { props = {}, className = '', inline = false } } = node;

    const nodeView = {
      dom: window.document.createElement('reactelement'),

      stopEvent (event) {
        // Allow dragging (enable on view spec also)
        // if (event.type.startsWith('drag')) return false;

        return true;
      },

      updateReactElement () {
        ReactDOM.render(
          <ReactEmbededElement
            prosemirrorNode={node}
            onCreated={onReactElementDomCreated}
          />,
          this.dom
        );
      }
    };

    nodeView.dom.id = uuidv4();
    nodeView.dom.setAttribute('props', encodeURI(JSON.stringify(props)));
    nodeView.dom.setAttribute('inline', inline);
    nodeView.dom.style.display = inline ? 'inline-block' : 'block';
    nodeView.dom.className = className;

    // First render
    nodeView.updateReactElement();

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

  if (schema.nodes.react_element) {
    nodeViews.react_element = reactElementNodeView(options);
  }

  if (schema.marks.link) {
    nodeViews.link = linkNodeView(options);
  }

  return nodeViews;
};
