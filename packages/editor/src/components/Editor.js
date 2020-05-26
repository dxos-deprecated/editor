//
// Copyright 2020 Wireline, Inc.
//

import React, { useRef, useEffect, useCallback, Fragment } from 'react';

import { makeStyles } from '@material-ui/core/styles';

import 'prosemirror-view/style/prosemirror.css';

import { createProsemirrorView } from '../lib/prosemirror-view';

const useClasses = makeStyles(theme => ({
  root: ({ backgroundColor = '#ffffff' }) => ({
    flexGrow: 1,
    overflow: 'auto',
    backgroundColor,
    cursor: 'text',
  }),

  editor: ({ backgroundColor = '#ffffff' }) => ({
    padding: theme.spacing(1),
    backgroundColor,
    outline: 'none',

    '& .cursor': {
      position: 'relative',
      marginLeft: -1.5,
      marginRight: -1.5,
      borderLeft: '1.5px solid',
      borderRight: '1.5px solid',
      wordBreak: 'normal',
      pointerEvents: 'none',
      opacity: 0.5,

      '& > .name': {
        opacity: 1,
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
  })
}));

const Editor = ({ sync, onCreated = () => null }) => {
  const classes = useClasses();
  const prosemirrorView = useRef();
  const editorDom = useRef();

  useEffect(() => {
    prosemirrorView.current = createProsemirrorView(editorDom.current, {
      sync
    });

    window.pView = prosemirrorView.current;

    onCreated({ view: prosemirrorView.current, a: 2 });

    return () => {
      prosemirrorView.current.destroy();
    };
  }, []);

  const handleContainerClick = useCallback(() => {
    prosemirrorView.current.focus();
  }, [prosemirrorView]);

  const handleEditorClick = useCallback(event => {
    // Avoid root click handler (handleContainerClick)
    event.stopPropagation();
  }, []);

  return (
    <Fragment>
      <div className={classes.root} onClick={handleContainerClick}>
        <div
          spellCheck={false}
          className={classes.editor}
          ref={editorDom}
          onClick={handleEditorClick}
        />
      </div>
    </Fragment>
  );
};

export default Editor;

// class EditorComponent extends Component {

//   static defaultProps = {
//     toolbar: undefined,
//     onCreated: undefined,
//     classes: {},
//     ...defaultViewProps
//   };

//   _editor = React.createRef();

//   state = {
//     /** @type {EditorView} */
//     view: undefined,

//     toolbar: undefined,
//   };

//   static getDerivedStateFromProps(props) {
//     const { toolbar } = props;

//     return {
//       toolbar
//     };
//   }

//   componentDidMount() {
//     this.init();
//   }

//   componentWillUnmount() {
//     this.destroy();
//   }

//   createProsemirrorView = ({
//     schema,
//     htmlContent,
//     contextMenu,
//     suggestions,
//     sync,
//     nodeViews,
//     schemaEnhancers,
//     options,
//     onContentChange,
//     onKeyDown
//   }) => {

//     const {
//       onCreated,
//     } = this.props;

//     const viewConfig = {
//       schema: sync ? 'full' : schema,
//       htmlContent,
//       contextMenu,
//       suggestions,
//       sync,
//       nodeViews,
//       schemaEnhancers,
//       options,
//       onContentChange,
//       onKeyDown
//     };

//     const view = createProsemirrorView(this._editor.current, viewConfig);
//     view.id = uuid();

//     this.setState({ view }, () => onCreated ? onCreated({
//       view,
//       destroy: this.destroy,
//       init: this.init,
//       reset: this.reset
//     }) : null);
//   }

//   reset = () => {
//     this.destroy();
//     this.init();
//   }

//   init = () => {
//     this.createProsemirrorView(this.props);
//   }

//   destroy = () => {
//     this.destroyProsemirrorView();

//     this.setState({
//       view: undefined,
//       toolbar: undefined
//     });
//   }

//   destroyProsemirrorView = () => {
//     const { view } = this.state;

//     try {
//       view.destroy();
//     } catch (err) { } // eslint-disable-line no-empty
//   }

//   handleEditorContainerClick = () => {
//     const { view } = this.state;

//     view.focus();
//   };

//   render() {
//     const { contextMenu, suggestions, classes } = this.props;
//     const { view, toolbar } = this.state;

//     return (
//       <div className={classes.root}>
//         {suggestions && <Suggestions view={view} {...suggestions} />}
//         {contextMenu && <ContextMenu view={view} {...contextMenu} />}
//         {toolbar && (
//           <div className={classes.toolbarContainer}>
//             <Toolbar view={view} {...toolbar} />
//           </div>
//         )}

//         <div className={classes.editorContainer} onClick={this.handleEditorContainerClick}>
//           <div ref={this._editor} className={classes.editor} />
//         </div>
//       </div>
//     );
//   }
// }

