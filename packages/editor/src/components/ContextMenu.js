//
// Copyright 2019 Wireline, Inc.
//

import React, { Component } from 'react';
import { TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import PropTypes from 'prop-types';

import { contextMenuPluginKey, contextMenuPluginDefaults } from '../plugins/context-menu-plugin';
import Menu from './Menu';

class ContextMenu extends Component {

  state = {
    prevViewId: undefined,
    open: false,
    options: undefined,
    position: undefined
  }

  static defaultProps = {
    renderMenuItem: option => option.label,
    getOptions: () => [],
    onSelect: () => null,
    triggerMenuEventKeys: contextMenuPluginDefaults.triggerMenuEventKeys,
    ...Menu.defaultProps
  }

  static getDerivedStateFromProps(props, state) {
    const { view } = props;
    const { prevViewId } = state;

    if (view && view.id !== prevViewId) {
      return {
        prevViewId: view.id
      };
    }

    return null;
  }

  componentDidUpdate(prevProps) {
    const { view } = this.props;
    const { view: prevView = {} } = prevProps;

    if (view && view.id !== prevView.id) {
      let originalDispatch = view._props.dispatchTransaction;

      view._props.originalDispatch = originalDispatch;

      // Register to view changes.
      view._props.dispatchTransaction = transaction => {
        originalDispatch(transaction);

        const meta = transaction.getMeta(contextMenuPluginKey);

        if (!meta) return;

        this.handleViewUpdate(meta);
      };
    }
  }

  updateOptions = () => {
    const { getOptions } = this.props;

    const options = getOptions();

    this.setState({ options });
  }

  handleViewUpdate = data => {
    if (data.open) {
      return this.handleOpenMenu(data);
    }

    this.setState({ open: false });
  }

  handleOpenMenu = ({ position }) => {
    this.updateOptions();

    this.setState({
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

  handleSelectOption = async (option) => {
    const { view, onSelect } = this.props;

    await onSelect(option, view);

    view.dispatch(
      view.state.tr
        .setSelection(
          TextSelection.fromJSON(view.state.tr.doc, {
            type: 'text',
            anchor: view.state.selection.to,
            head: view.state.selection.to
          })
        )
        .scrollIntoView()
    );

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

  render() {
    const { view, renderMenuItem, emptyOptionsLabel, maxVisibleOptions } = this.props;
    const { open, options, position } = this.state;

    if (!open) return null;

    return (
      <Menu
        options={options}
        onSelect={this.handleSelectOption}
        onClose={this.handleCloseMenu}
        onContextMenu={this.handleContextMenu}
        position={position}
        renderMenuItem={renderMenuItem}
        emptyOptionsLabel={emptyOptionsLabel}
        maxVisibleOptions={maxVisibleOptions}
        viewDom={view.dom}
      />
    );
  }
}

export const ContextMenuPropTypes = PropTypes.shape({
  view: PropTypes.instanceOf(EditorView),
  getOptions: PropTypes.func,
  onSelect: PropTypes.func,
  renderMenuItem: PropTypes.func,
  emptyOptionsLabel: PropTypes.string,
  maxVisibleItems: PropTypes.number,
  triggerMenuEventKeys: PropTypes.arrayOf(PropTypes.string)
}).isRequired;

ContextMenu.propTypes = ContextMenuPropTypes;

export default ContextMenu;
