//
// Copyright 2019 Wireline, Inc.
//

import React from 'react';
import classnames from 'classnames';

import { withStyles } from '@material-ui/core';

import Button from '@material-ui/core/Button';
import Tooltip from '@material-ui/core/Tooltip';

import { grey } from '@material-ui/core/colors';

const styles = theme => ({
  button: {
    minWidth: 0,
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(0.5)
  },
  buttonActive: {
    backgroundColor: grey[200]
  },
  buttonIcon: {
    margin: 0,
    color: grey[800]
  },
  buttonIconDisabled: {
    color: grey[400]
  }
});

export const ToolbarButton = withStyles(styles)(
  ({
    children,
    icon: IconComponent,
    title,
    active = false,
    disabled = false,
    onClick,
    classes
  }) => (
    <Tooltip title={title}>
      <span>
        <Button
          classes={{
            root: classnames(classes.button, active && classes.buttonActive),
            startIcon: classes.buttonIcon
          }}
          color="default"
          disabled={disabled}
          onClick={onClick}
          {...(IconComponent
            ? {
              startIcon: (
                <IconComponent
                  className={classnames(
                    disabled && classes.buttonIconDisabled
                  )}
                />
              )
            }
            : {})}
        >
          {children || ' '}
        </Button>
      </span>
    </Tooltip>
  )
);

export default ToolbarButton;