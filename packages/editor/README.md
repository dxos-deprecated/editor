# Editor
React editor component based on [Prosemirror](http://prosemirror.net/).

## Features
- Collaborative support. Using [Yjs](https://github.com/yjs/yjs) as CRDT engine.
- Status indicators.
- Multiple schemas: `basic`, `text-only`, `source-code` and `full`.
- Context menu.
- Suggestions on type.

## Install
`yarn add @dxos/editor`

### Beta release:
`yarn add @dxos/editor@beta`

## Usage

### Basic
```javascript
import React from 'react';

import { Editor } from '@dxos/editor';

export const MyEditor = () => {
  return <Editor />;
}
```

### With editor instance
Here you can pass a callback to receive the `editor` instance (See [Api](#api))

```javascript
import React, { useCallback, useState } from 'react';

import { Editor } from '@dxos/editor';

export const MyEditor = () => {
  const [editor, setEditor] = useState();

  const handleEditorCreated = useCallback(editor => {
    setEditor(editor);
  });

  return (<Editor onCreated={handleEditorCreated} />);
};
```


## Exported components

- `<Editor />`: Base editor.
- `<SourceCodeEditor />`: Custom `<Editor />` configured for source code editing.


## Api

### Editor instance

When Editor is created it will call [`onCreated`](#onCreated) callback with an `editor` instance. This instance allows you to control current editor.

#### editor.createReactElement
`function(props: object)`

You can insert a React element that should be placed on current selection or position. This functions creates an _slot_ for you element based on `props`. You must provide a valid [`reactElementRenderFn`](#reactElementRenderFn) that will be used to render the real React element that you need. 

`props` must be any valid JSON serializable object because it will be used to create a Prosemirror and DOM node that holds your React element. 

See [react content story](stories/ReactContent.js) for a complete example.

#### editor.sync.processRemoteUpdate
`function(update: UInt8Array, origin: Object|string)`

Applies updates to shared document being used.

#### editor.sync.status.processRemoteUpdate
`function(update: UInt8Array)`

Applies an update from other peer status.

#### editor.sync.status.setUserName
`function(name: string)`

Set local user name. This will trigger [sync.status.onLocalUpdate](#sync.status.onLocalUpdate) callback property.

#### editor.view
`View`

Prosemirror [`View`](#https://prosemirror.net/docs/ref/#view) instance of current editor.


### `<Editor />` component properties

#### onCreated
`function(editor)`

Callback called after editor was created. It returns an editor instance with some method to handle it. See [Editor instance API](#editor-instance).

Example:

```javascript
  <Editor onCreated={editor => '...'} />
```


#### onContentChange
`function(html, prosemirrorDoc)`

Callback for change event

Example:

```javascript
  <Editor onContentChange={(html, prosemirrorDoc) => '...'} />
```


#### schema
`'full' | 'basic' | 'text-only' | 'source-code' | schema`

Schema to be used. For non string option, see: [Prosemirror schema definition](https://prosemirror.net/docs/ref/#model.Schema)

Example:

```javascript
  <Editor
    schema="text-only"
  />
```


#### toolbar
`boolean|object`

Only available for `full` schema.

Example:

```javascript
  <Editor
    schema="full"
    toolbar
  />
```


##### toolbar.imagePopupSrcLabel
`string`

Customize label for image popup.

Example:

```javascript
  <Editor
    schema="full"
    toolbar={{
      imagePopupSrcLabel: 'Any image address'
    }}
  />
```


##### toolbar.classes
`object`

Material UI Toolbar classes. See [Toolbar classes](https://material-ui.com/api/toolbar/#css)

Example:

```javascript
...
import { makeStyles } from '@material-ui/core/styles';

const useToolbarStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'grey'
  }
}));

const StyledToolbar = () => {
  const toolbarClasses = useToolbarStyles();

  return (
    <Editor
      toolbar={{
        classes: toolbarClasses
      }}
    />
  );
};
```


#### reactElementRenderFn
`function(props: object)`

Callback function to render your custom react component.

This function will be called when Prosemirror needs to render a prosemirror node called `<reactelement props="encodedPropsForDOM"/>` and must return a valid React element based on the `props` parameter.

This `<reactelement/>` prosemirror node is the result of call: `editor.createReactElement({ ...props })`. See [`createReactElement`](#createReactElement)

Example: See [react content story](stories/ReactContent.js) for a complete example.


#### contextmenu
`object`

Context menu options.

##### contextmenu.getOptions
`function(): Array<options>`

Function to get options. Will be called every time the menu is shown.
Must return an __ordered__ array with (mixed):
- Options: `{ id: 'unique id for option', label: 'option label' }` or
- Subheaders: `{ subheader: 'Subheader label' }`.

##### contextmenu.onSelect
`function(option, view)`

Callback to let you do something on option selected. `option` is the same as you pass on `getOptions`. `view` is the current [Prosemirror view instance](https://prosemirror.net/docs/ref/#view).

##### contextmenu.renderMenuItem
`function(option)`

Allows you to render a custom item for the menu. Must return a valid React element.

##### contextmenu.emptyOptionsLabel
`string`

Text to show on empty options menu.

##### contextmenu.maxVisibleItems
`number`

Number of max visible items.

Example: See [context menu story](stories/ContextMenu.js) for a complete example.


#### suggestions
`object`

Suggestions menu options. Menu will shown fi you press particular key combinations.

##### suggestions.getOptions
Same as [`contextmenu.getOptions`](#contextmenu.getOptions)


##### suggestions.onSelect
Same as [`contextmenu.onSelect`](#contextmenu.onSelect)


##### suggestions.renderMenuItem
Same as [`contextmenu.renderMenuItem`](#contextmenu.renderMenuItem)


##### suggestions.emptyOptionsLabel
Same as [`contextmenu.emptyOptionsLabel`](#contextmenu.emptyOptionsLabel)


##### suggestions.maxVisibleItems
Same as [`contextmenu.maxVisibleItems`](#contextmenu.maxVisibleItems)


##### suggestions.triggerEventKeys
`array`

Array of chars that will trigger the context menu with suggestions. Defaults to: `['@', '#']`.

Example: See [suggestions story](stories/Suggestions.js) for a complete example.


#### sync
`object`

Sync options for collaborative edition. It uses a [Doc](https://github.com/yjs/yjs#YDoc) as CRDT.

##### sync.id
`string` Required

Unique ID for user.

##### sync.onLocalUpdate
`function(update: UInt8Array, doc: Doc)`

Callback called on every local update of the underlying doc. You must share this update with your peers.

##### sync.doc
`Doc`

If you have an instance of [Doc](https://github.com/yjs/yjs#YDoc) you can provide them and editor will use it as shared doc.

##### sync.status
`object`

Status indicator options.

###### sync.status.onLocalUpdate
`function(update)`

Callback called on every local status update. You must share this update with your peers.


#### classes: `object`
Classes for editor.

Available classes: 
- `root`: Root Editor container.
- `toolbarContainer`: Toolbar.
- `editorContainer`: Prosemirror editor container.
- `editor`: Prosemirror editor.

Example:

```javascript
...
import { makeStyles } from '@material-ui/core/styles';

const useEditorStyles = makeStyles(() => ({
  root: {
    backgroundColor: 'gray'
  },
  toolbarContainer: {
    border: '1px solid blue'
  }
}));

const StyledToolbar = () => {
  const editorClasses = useEditorStyles();

  return (
    <Editor
      classes={classes}
    />
  );
};
```


### `<SourceCodeEditor />` component properties

#### onContentChange
`function(sourceCodeText: string)`

Callback for change event.

Example:

```javascript
  <Editor onContentChange={sourceCodeText => '...'} />
```


#### language
`'bash' | 'c' | 'go' | 'java' | 'javascript' | 'markdown' | 'rust' | 'xml'`

Source code language (for highlight options)

Example:

```javascript
  <Editor
    language="javascript"
  />
```


#### highlight
`boolean` | Default `true`

Enables highlight on source.

Example:

```javascript
  <Editor
    highlight={false}
  />
```

### Same other props than <Editor />

## Storybook
You can check the [stories](stories/editor.stories.js) for running examples.

To start the storybook:
```bash
yarn storybook
```


