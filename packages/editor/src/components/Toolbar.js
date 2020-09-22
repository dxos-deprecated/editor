//
// Copyright 2020 DXOS.org
//

import React, { useEffect, useCallback, useState } from 'react';

import { undo, redo } from 'prosemirror-history';
import { toggleMark } from 'prosemirror-commands';

import { makeStyles } from '@material-ui/core';
import MUIToolbar from '@material-ui/core/Toolbar';
import MUIDivider from '@material-ui/core/Divider';

import ListBulletedIcon from '@material-ui/icons/FormatListBulleted';
import ListNumberedIcon from '@material-ui/icons/FormatListNumbered';

import RedoIcon from '@material-ui/icons/Redo';
import UndoIcon from '@material-ui/icons/Undo';
import CodeIcon from '@material-ui/icons/Code';
import FormatBoldIcon from '@material-ui/icons/FormatBold';
import FormatItalicIcon from '@material-ui/icons/FormatItalic';
import FormatUnderlinedIcon from '@material-ui/icons/FormatUnderlined';

import grey from '@material-ui/core/colors/grey';

import ToolbarButton from './ToolbarButton';
import ToolbarImageButton from './ToolbarImageButton';

import { useProsemirrorView } from '../lib/hook';
import { markActive, toggleList, canToggleList, isListItemOfType } from '../lib/prosemirror-helpers';
import NodeTypeButton from './NodeTypeButton';

export const useStyles = makeStyles(theme => ({
  toolbar: {
    minHeight: 'fit-content',
    paddingTop: theme.spacing(0.5),
    paddingBottom: theme.spacing(0.5),
    backgroundColor: grey[50],
    whiteSpace: 'nowrap'
  },

  divider: {
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5),
    height: 'auto',
    alignSelf: 'stretch'
  }
}));

const buildButtons = (schema, props) => {
  const buttons = [];

  const historyButtons = [];
  const markButtons = [];
  const wrapperButtons = [];
  const extraButtons = [];

  historyButtons.push(
    { name: 'undo', title: 'Undo last change', icon: UndoIcon, enabled: undo, onClick: undo },
    { name: 'redo', title: 'Redo last change', icon: RedoIcon, enabled: redo, onClick: redo }
  );

  const {
    bullet_list: bulletList,
    image,
    ordered_list: orderedList
  } = schema.nodes;
  const { strong, em, underline, code } = schema.marks;

  const nodeButton = {
    component: () => <NodeTypeButton schema={schema} onButtonClick={props.handleButtonClick} />
  };

  if (strong) {
    markButtons.push({
      name: 'mark-strong',
      title: 'Strong',
      icon: FormatBoldIcon,
      active: markActive(strong),
      onClick: toggleMark(strong)
    });
  }

  if (em) {
    markButtons.push({
      name: 'mark-emphasis',
      title: 'Emphasis',
      icon: FormatItalicIcon,
      active: markActive(em),
      onClick: toggleMark(em)
    });
  }

  if (underline) {
    markButtons.push({
      name: 'mark-underlined',
      title: 'Underlined',
      icon: FormatUnderlinedIcon,
      active: markActive(underline),
      onClick: toggleMark(underline)
    });
  }

  if (code) {
    markButtons.push({
      name: 'mark-monospace',
      title: 'Monospace font',
      icon: CodeIcon,
      active: markActive(code),
      onClick: toggleMark(code)
    });
  }

  if (orderedList) {
    wrapperButtons.push({
      name: 'wrapper-ordered-list',
      title: 'Toggle ordered list',
      icon: ListNumberedIcon,
      onClick: toggleList(orderedList),
      enabled: canToggleList(orderedList),
      active: isListItemOfType(orderedList)
    });
  }

  if (bulletList) {
    wrapperButtons.push({
      name: 'wrapper-bullet-list',
      title: 'Toggle bullet list',
      icon: ListBulletedIcon,
      onClick: toggleList(bulletList),
      enabled: canToggleList(bulletList),
      active: isListItemOfType(bulletList)
    });
  }

  if (image) {
    extraButtons.push({
      component: () => (
        <ToolbarImageButton
          sourceParser={props.imageSourceParser}
          onUpload={props.onImageUpload}
        />
      )
    });
  }

  if (props.customButtons) {
    extraButtons.push(...props.customButtons);
  }

  buttons.push(
    ...historyButtons,
    { divider: true },
    nodeButton,
    markButtons.length > 0 && { divider: true },
    ...markButtons,
    wrapperButtons.length > 0 && { divider: true },
    ...wrapperButtons,
    extraButtons.length > 0 && { divider: true },
    ...extraButtons
  );

  return buttons.filter(Boolean);
};

const Toolbar = ({
  classes,
  customButtons,
  imageSourceParser,
  onImageUpload
}) => {
  const { toolbar: toolbarClass, divider: dividerClass } = useStyles();

  const [buttons, setButtons] = useState([]);

  const [prosemirrorView] = useProsemirrorView();

  const handleButtonClick = useCallback(button => () => {
    const { state, dispatch } = prosemirrorView;
    button.onClick(state, dispatch);
    prosemirrorView.focus();
  }, [prosemirrorView]);

  useEffect(() => {
    if (!prosemirrorView) return;

    setButtons(
      buildButtons(
        prosemirrorView.state.schema,
        {
          customButtons,
          handleButtonClick,
          imageSourceParser,
          onImageUpload
        }
      )
    );
  }, [prosemirrorView]);

  return (
    <MUIToolbar disableGutters classes={classes} className={toolbarClass}>
      {buttons.map((button, index) => {
        if (button.divider) {
          return <MUIDivider key={`divider-${index}`} orientation='vertical' className={dividerClass} />;
        }

        if (button.component) {
          const { component: Component } = button;
          return <Component key={`component-button-${index}`} />;
        }

        return (
          <ToolbarButton
            key={button.name}
            name={button.name}
            icon={button.icon}
            title={button.title}
            onClick={handleButtonClick(button)}
            disabled={button.enabled && !button.enabled(prosemirrorView.state)}
            active={button.active && button.active(prosemirrorView.state)}
          />
        );
      })}
    </MUIToolbar>
  );
};

export default Toolbar;
