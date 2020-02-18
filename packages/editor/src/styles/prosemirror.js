//
// Copyright 2019 Wireline, Inc.
//

const styles = theme => ({
  editor: {
    wordWrap: 'break-word',
    whiteSpace: 'break-spaces',
    '-webkit-font-variant-ligatures': 'none',
    fontVariantLigatures: 'none',
    fontFeatureSettings: '"liga" 0',

    outline: 'none',
    fontSize: 22,
    flex: 1,
    minHeight: '100%',
    width: '100%',

    '& pre': {
      whiteSpace: 'pre-wrap',
      backgroundColor: theme.palette.grey[50],
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      padding: theme.spacing(1)
    },

    '& li': {
      position: 'relative'
    },

    '& .ProseMirror-hideselection *::selection': {
      background: 'transparent'
    },

    '& .ProseMirror-hideselection *::-moz-selection': {
      background: 'transparent'
    },

    '& .ProseMirror-hideselection': {
      caretColor: 'transparent'
    },

    '& .ProseMirror-selectednode': {
      outline: '2px solid #8cf'
    },

    '& li.ProseMirror-selectednode': {
      outline: 'none'
    },

    '& li.ProseMirror-selectednode:after': {
      content: '',
      position: 'absolute',
      left: '-32px',
      right: '-2px',
      top: '-2px',
      bottom: '-2px',
      border: '2px solid #8cf',
      pointerEvents: 'none'
    },

    '& p': {
      marginTop: '.5em',
      marginBottom: '.5em'
    },

    // TODO(burdon): Add placeholder content initially?
    // Fix for empty doc content => bad status position.
    '& > span.status': {
      top: 11,
    },

    '& .status': {
      display: 'inline-block',
      position: 'relative',
      userSelect: 'none'
    },

    '& .status > .cursor': {
      opacity: '0.3',
      display: 'inline-block',
      width: 4,
      cursor: 'text'
    },

    '& .status > .username': {
      color: 'white',
      top: '0',
      left: '0',
      width: 'auto',
      overflow: 'visible',
      position: 'absolute',
      display: 'table',
      transform: 'translateY(-100%)',
      fontSize: 12,
      padding: '1px 4px',
      whiteSpace: 'nowrap'
    }
  }
});

export default styles;
