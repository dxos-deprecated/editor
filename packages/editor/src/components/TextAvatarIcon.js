//
// Copyright 2020 Wireline, Inc.
//

import React from 'react';

import { makeStyles } from '@material-ui/core';

import Avatar from '@material-ui/core/Avatar';

const useStyles = makeStyles(theme => ({
  avatarIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    fontSize: theme.typography.body1.fontSize,
    color: theme.palette.text.primary,
    backgroundColor: 'transparent'
  },

  avatarIconText: {
    fontSize: theme.typography.button.fontSize
  }
}));

const TextAvatarIcon = ({ children }) => {
  const classes = useStyles();

  return (
    <Avatar variant='square' className={classes.avatarIcon}>
      <span className={classes.avatarIconText}>{children}</span>
    </Avatar>
  );
};

export default TextAvatarIcon;
