//
// Copyright 2020 DXOS.org
//

import ReactDOM from 'react-dom';
import React from 'react';
import { uuidv4 } from 'lib0/random';

import ReactEmbededElement from '../components/ReactEmbededElement';
import { NodeSelection } from 'prosemirror-state';

const reactElementNodeView = ({ onReactElementDomCreated }) => {
  return function (node, view, getPos) {
    const { attrs: { props = {} } } = node;

    const nodeView = {
      dom: window.document.createElement('reactelement'),

      selected: false,

      locked: true,

      deselectNode () {
        this.selected = false;
        this.updateReactElement();
      },

      selectNode () {
        this.selected = true;
        this.updateReactElement();
      },

      stopEvent (event) {
        // Allow dragging (enable on view spec also)
        // if (event.type.startsWith('drag')) return false;

        if (event.type === 'mousedown' && event.ctrlKey) {
          const { tr } = view.state;
          const newState = view.state.apply(
            tr.setSelection(NodeSelection.create(tr.doc, getPos()))
          );
          view.updateState(newState);

          return false;
        }

        return true;
      },

      updateReactElement () {
        ReactDOM.render(
          <ReactEmbededElement
            prosemirrorNode={node}
            selected={this.selected}
            onCreated={onReactElementDomCreated}
          />,
          this.dom
        );
      }
    };

    nodeView.dom.setAttribute('props', encodeURI(JSON.stringify(props)));
    nodeView.dom.id = uuidv4();
    // Ctrl
    nodeView.dom.addEventListener('click', event => {
      if (event.ctrlKey) {
        event.stopPropagation();
      }
    }, { capture: true });

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
