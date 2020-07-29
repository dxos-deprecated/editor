//
// Copyright 2020 DXOS.org
//

import ReactDOM from 'react-dom';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';

import { makeStyles } from '@material-ui/core/styles';

import Toolbar from './Toolbar';
import ContextMenu from './ContextMenu';
import Suggestions from './Suggestions';
import ReactEmbededElement from './ReactEmbededElement';

import { createProsemirrorEditor } from '../lib/prosemirror-editor';
import { useProsemirrorView, useProsemirrorTransaction } from '../lib/hook';
import { EditorContextProvider } from '../lib/context';

const useStyles = makeStyles(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    maxHeight: '100%'
  },

  editorContainer: {
    flexGrow: 1,
    overflow: 'auto',
    padding: theme.spacing(1),
    backgroundColor: '#ffffff',
    cursor: 'text',
    maxHeight: 'fill-available'
  },

  editor: ({ initialFontSize }) => ({
    position: 'relative',
    backgroundColor: '#fffff',
    fontSize: initialFontSize,
    outline: 'none',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0',
    whiteSpace: 'break-spaces',
    wordBreak: 'break-word',
    textAlign: 'left',

    '& pre': {
      whiteSpace: 'pre-wrap',
      backgroundColor: theme.palette.grey[200],
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1)
    },

    '& li': {
      position: 'relative'
    },

    '& p': {
      marginTop: '.5em',
      marginBottom: '.5em'
    },

    '& p a.hovered': {
      cursor: 'pointer'
    },

    '& .cursor': {
      position: 'relative',
      marginLeft: -1.5,
      marginRight: -1.5,
      borderLeft: '1.5px solid',
      borderRight: '1.5px solid',
      wordBreak: 'normal',
      pointerEvents: 'none',

      '& > .name': {
        position: 'absolute',
        transform: 'translateY(-100%)',
        top: '0',
        left: -1.5,
        padding: '1px 4px',
        color: 'white',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        fontSize: 12
      }
    }
  }),

  toolbarContainer: {
    flex: '0 1 auto'
  }
}));

const Editor = ({
  classes: userClasses = {},
  contextMenu,
  initialContent,
  initialFontSize = 22,
  language,
  onContentChange,
  onCreated = () => null,
  onKeyDown,
  prosemirrorPlugins: plugins,
  reactElementRenderFn = () => null,
  schema = 'basic',
  suggestions,
  sync,
  toolbar
}) => {
  const classes = useStyles({ initialFontSize });
  const mockInputDom = useRef();
  const editor = useRef();
  const editorDom = useRef();
  const [prosemirrorView, setProsemirrorView] = useProsemirrorView();
  const [prosemirrorTransaction, setProsemirrorTransaction] = useProsemirrorTransaction();

  const [reactElements, setReactElements] = useState([]);

  useEffect(() => {
    if (prosemirrorView) {
      return () => {
        prosemirrorView.destroy();
      };
    }

    editor.current = createProsemirrorEditor(editorDom.current, {
      mockInputDom,
      contextMenu,
      initialContent,
      language,
      onKeyDown: handleKeyDown,
      onReactElementDomCreated: handleReactElementDomCreated,
      onTransaction: setProsemirrorTransaction,
      plugins,
      schema,
      suggestions,
      sync
    });

    setProsemirrorView(editor.current.view);
    onCreated(editor.current);
  }, [prosemirrorView]);

  useEffect(() => {
    if (!prosemirrorTransaction) return;

    const { transaction, newState } = prosemirrorTransaction;

    if (onContentChange && transaction.docChanged) {
      onContentChange(prosemirrorView.dom.innerHTML, newState.doc);
    }
  }, [prosemirrorTransaction, prosemirrorView]);

  const handleEditorContainerContextMenu = useCallback(event => {
    event.preventDefault();

    editor.current.view.focus();

    const contextMenuEvent = new MouseEvent('mouseup', { button: 2 });

    editorDom.current.dispatchEvent(contextMenuEvent);
  }, []);

  const handleReactElementDomCreated = useCallback((props, dom) => {
    setReactElements(reactElements => [...reactElements, { dom, props }]);
  }, []);

  const handleEditorContainerClick = useCallback(() => {
    editor.current.view.focus();
  }, [editor]);

  const handleEditorClick = useCallback(event => {
    // Avoid root click handler (handleEditorContainerClick)
    event.stopPropagation();
  }, [editor]);

  const handleKeyDown = event => {
    const cancelled = !mockInputDom.current.dispatchEvent(new KeyboardEvent('keydown', {
      key: event.key,
      code: event.code,
      location: event.location,
      ctrlKey: event.ctrlKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
      metaKey: event.metaKey,
      repeat: event.repeat,
      isComposing: event.isComposing,
      charCode: event.charCode,
      keyCode: event.keyCode,
      which: event.which,
      bubbles: true,
      cancelable: true
    }));

    return cancelled;
  };

  return (
    <div
      className={classnames(classes.root, userClasses.root)}
    >
      {/* Mock input for events */}
      <input ref={mockInputDom} type='text' onKeyDown={onKeyDown} style={{ display: 'none' }} />

      {toolbar && (
        <div className={classnames(classes.toolbarContainer, userClasses.toolbarContainer)}>
          <Toolbar {...toolbar} />
        </div>
      )}
      <div
        onClick={handleEditorContainerClick}
        onContextMenu={handleEditorContainerContextMenu}
        className={classnames(classes.editorContainer, userClasses.editorContainer)}
      >
        {suggestions && <Suggestions {...suggestions} />}
        {contextMenu && <ContextMenu {...contextMenu} />}
        <div
          ref={editorDom}
          className={classnames(classes.editor, userClasses.editor)}
          onClick={handleEditorClick}
          // onKeyDown={event => console.log('ACA', event)}
          spellCheck={false}
        />
      </div>

      {
        // Placeholders of React.Portals to real components
        reactElements.map(({ dom, props }, i) => (
          ReactDOM.createPortal(
            <ReactEmbededElement>
              {reactElementRenderFn({ key: i, ...props })}
            </ReactEmbededElement>,
            dom
          )
        ))
      }
    </div>
  );
};

export default props => (
  <EditorContextProvider>
    <Editor {...props} />
  </EditorContextProvider>
);
