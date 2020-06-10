//
// Copyright 2020 Wireline, Inc.
//

import React, { Component } from 'react';
import { EditorView } from 'prosemirror-view';
import PropTypes from 'prop-types';

import { contextMenuPluginKey } from '../plugins/context-menu-plugin';
import { FocusedMenu } from './Menu';

class ContextMenu extends Component {
  static defaultProps = {
    ...FocusedMenu.defaultProps
  }

  static getDerivedStateFromProps (props, state) {
    const { view } = props;
    const { prevViewId } = state;

    if (view && view.id !== prevViewId) {
      return {
        prevViewId: view.id
      };
    }

    return null;
  }

  state = {
    prevViewId: undefined,
    open: false,
    options: undefined,
    position: undefined
  }

  componentDidUpdate (prevProps) {
    const { view } = this.props;
    const { view: prevView = {} } = prevProps;

    if (view && view.id !== prevView.id) {
      const originalDispatch = view._props.dispatchTransaction;

      view._props.originalDispatch = originalDispatch;

      // Register to view changes.
      view._props.dispatchTransaction = transaction => {
        const { oldState, newState } = originalDispatch(transaction);

        const meta = transaction.getMeta(contextMenuPluginKey);

        if (meta) {
          this.handleViewUpdate(meta);
        }

        return { oldState, newState, transaction };
      };
    }
  }

  handleViewUpdate = data => {
    if (data.open) {
      return this.handleOpenMenu(data);
    }

    this.setState({ open: false });
  }

  handleOpenMenu = ({ position }) => {
    const { getOptions } = this.props;

    this.setState({
      options: getOptions(),
      open: true,
      position
    });
  }

  handleCloseMenu = () => {
    const { view } = this.props;

    this.setState({ open: false });

    view.dispatch(
      view.state.tr.setMeta(contextMenuPluginKey, {
        open: false
      })
    );
  }

  handleSelectOption = option => {
    const { view, onSelect } = this.props;

    onSelect(option, view);

    view.focus();
  }

  handleContextMenu = event => {
    event.preventDefault();
    event.persist();

    this.setState({
      open: false
    }, () => this.setState({
      open: true,
      position: {
        top: event.clientY,
        left: event.clientX
      }
    }));
  }

  render () {
    const { view, renderMenuItem, emptyOptionsLabel, maxVisibleItems } = this.props;
    const { open, options, position } = this.state;

    if (!view) return null;

    return (
      <FocusedMenu
        open={open}
        dom={view.dom}
        options={options}
        onSelect={this.handleSelectOption}
        onClose={this.handleCloseMenu}
        onContextMenu={this.handleContextMenu}
        position={position}
        renderMenuItem={renderMenuItem}
        emptyOptionsLabel={emptyOptionsLabel}
        maxVisibleItems={maxVisibleItems}
      />
    );
  }
}

export const ContextMenuPropTypes = PropTypes.shape({
  view: PropTypes.instanceOf(EditorView),
  getOptions: PropTypes.func
}).isRequired;

ContextMenu.propTypes = ContextMenuPropTypes;

export default ContextMenu;
