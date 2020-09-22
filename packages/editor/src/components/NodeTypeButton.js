//
// Copyright 2020 DXOS.org
//

import React, { useState } from 'react';

import { setBlockType, wrapIn } from 'prosemirror-commands';

import { ClickAwayListener } from '@material-ui/core';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import CodeIcon from '@material-ui/icons/Code';
import FormatQuoteIcon from '@material-ui/icons/FormatQuote';
import Grid from '@material-ui/core/Grid';

import { blockActive } from '../lib/prosemirror-helpers';
import { useProsemirrorView } from '../lib/hook';

import TextAvatarIcon from './TextAvatarIcon';
import Tooltip from './Tooltip';
import ToolbarButton from './ToolbarButton';

function NodeTypeButton ({ schema, onButtonClick }) {
  const [open, setOpen] = useState(false);
  const [prosemirrorView] = useProsemirrorView();

  function handleTooltipClose () {
    setOpen(false);
  }

  function handleTooltipToogle () {
    setOpen(open => !open);
  }

  function handleButtonClick (button) {
    return function () {
      handleTooltipClose();
      return onButtonClick(button)();
    };
  }

  const {
    blockquote,
    code_block: codeBlock,
    heading,
    paragraph
  } = schema.nodes;

  const nodeButtons = [];

  if (paragraph) {
    nodeButtons.push({
      name: 'node-paragraph',
      title: 'Paragraph',
      icon: () => <TextAvatarIcon>P</TextAvatarIcon>,
      onClick: setBlockType(paragraph),
      enabled: setBlockType(paragraph),
      active: blockActive(paragraph)
    });
  }

  if (heading) {
    nodeButtons.push(...[1, 2, 3, 4, 5, 6].map((level, key) => ({
      name: `heading-${level}`,
      title: `Heading ${level}`,
      icon: () => <TextAvatarIcon>H{level}</TextAvatarIcon>,
      onClick: setBlockType(heading, { level }),
      enabled: setBlockType(heading, { level }),
      active: blockActive(heading, { level })
    })));
  }

  if (codeBlock) {
    nodeButtons.push({
      name: 'node-code',
      title: 'Code block',
      icon: CodeIcon,
      onClick: setBlockType(codeBlock),
      enabled: setBlockType(codeBlock),
      active: blockActive(codeBlock)
    });
  }

  if (blockquote) {
    nodeButtons.push({
      name: 'node-blockquote',
      title: 'Block quote',
      icon: FormatQuoteIcon,
      onClick: wrapIn(blockquote),
      enabled: wrapIn(blockquote),
      active: blockActive(blockquote)
    });
  }

  const oneButton = nodeButtons.length === 1;

  const activeButtonTitle = nodeButtons.find(button => button.active(prosemirrorView.state)).title;

  return (
    <Box
      mr={1}
      ml={1}
    >
      <ClickAwayListener onClickAway={handleTooltipClose}>
        <div>

          <Tooltip
            interactive
            PopperProps={{
              disablePortal: true
            }}
            onClose={handleTooltipClose}
            open={open}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title={
              <>
                <Grid container spacing={1}>
                  {
                    nodeButtons.map(button => (
                      <ToolbarButton
                        key={button.name}
                        name={button.name}
                        icon={button.icon}
                        title={button.title}
                        onClick={handleButtonClick(button)}
                        disabled={button.enabled && !button.enabled(prosemirrorView.state)}
                        active={button.active && button.active(prosemirrorView.state)}
                      />
                    ))
                  }
                </Grid>
              </>
            }
          >
            <Box width={100}>
              <Button
                disabled={oneButton}
                title='Change block type'
                fullWidth
                color='inherit'
                size='small'
                onClick={handleTooltipToogle}
              >
                {activeButtonTitle}
              </Button>
            </Box>
          </Tooltip>
        </div>
      </ClickAwayListener>
    </Box>
  );
}

export default NodeTypeButton;
