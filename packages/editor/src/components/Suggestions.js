//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';
import { EditorView } from 'prosemirror-view';
import PropTypes from 'prop-types';

import { suggestionsPluginKey } from '../plugins/suggestions-plugin';

import {
  KEY_ARROW_UP,
  KEY_ARROW_DOWN,
  KEY_ESCAPE,
  KEY_ENTER,
  KEY_TAB,
  KEY_SPACE
} from '../lib/keys';

import { UnfocusedMenu } from './Menu';

class Suggestions extends Component {
  state = {
    prevViewId: undefined,
    open: false,
    options: undefined,
    query: undefined,
    position: undefined,
    selectedIndex: 0,
    start: undefined,
    end: undefined
  }

  static defaultProps = {
    ...UnfocusedMenu.defaultProps,
    getOptions: () => []
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

  componentDidUpdate (prevProps) {
    const { view } = this.props;
    const { view: prevView = {} } = prevProps;

    if (view && view.id !== prevView.id) {
      const originalDispatch = view._props.dispatchTransaction;

      view._props.originalDispatch = originalDispatch;

      // Register to view changes.
      view._props.dispatchTransaction = transaction => {
        const { oldState, newState } = originalDispatch(transaction);

        const meta = transaction.getMeta(suggestionsPluginKey);

        if (meta) {
          this.handleViewUpdate(meta);
        }

        return { oldState, newState, transaction };
      };
    }
  }

  updateOptions = query => {
    const { getOptions } = this.props;

    const options = getOptions(query || '');

    if (options.length === 0 && query !== null) {
      this.handleCloseMenu();
      return false;
    }

    this.setState({ options, query });
    return true;
  }

  handleKeyPressed = key => {
    const { view } = this.props;
    const { selectedIndex, options } = this.state;

    if (!key) return;

    switch (key) {
      case KEY_ARROW_UP:
        if (selectedIndex < 1) break;
        this.setState({ selectedIndex: selectedIndex - 1 });
        break;

      case KEY_ARROW_DOWN:
        if (selectedIndex >= options.length - 1) break;
        this.setState({ selectedIndex: selectedIndex + 1 });
        break;

      case KEY_ESCAPE:
      case KEY_SPACE:
        this.handleCloseMenu();
        break;

      case KEY_ENTER:
      case KEY_TAB:
        this.handleSelectOption(options[selectedIndex]);
        this.handleCloseMenu();
        break;

      default:
        break;
    }

    view.dispatch(
      view.state.tr.setMeta(suggestionsPluginKey, {
        keyPressed: null
      })
    );
  }

  handleViewUpdate = data => {
    const { open, query } = this.state;

    if (data.open !== undefined) {
      if (!open && data.open) {
        return this.handleOpenMenu(data);
      }

      if (open && !data.open) {
        return this.setState({ open: false });
      }
    }

    if (data.query !== undefined && query !== data.query) {
      this.setState({ start: data.start, end: data.end });
      this.updateOptions(data.query);
      return;
    }

    this.handleKeyPressed(data.keyPressed);
  }

  handleOpenMenu = ({ position, query, start, end }) => {
    if (!this.updateOptions(query)) return;

    this.setState({
      open: true,
      position,
      selectedIndex: 0,
      start,
      end
    });
  }

  handleCloseMenu = () => {
    const { view } = this.props;

    this.setState({ open: false });

    view.dispatch(
      view.state.tr.setMeta(suggestionsPluginKey, {
        open: false
      })
    );
  }

  handleSelectOption = option => {
    const { view, onSelect } = this.props;
    const { start, end } = this.state;

    onSelect(option, view, start, end);

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
    const { open, options, position, selectedIndex } = this.state;

    if (!open) return null;

    return (
      <UnfocusedMenu
        options={options}
        onSelect={this.handleSelectOption}
        onClose={this.handleCloseMenu}
        onContextMenu={this.handleContextMenu}
        position={position}
        renderMenuItem={renderMenuItem}
        emptyOptionsLabel={emptyOptionsLabel}
        maxVisibleItems={maxVisibleItems}
        viewDom={view.dom}
        selectedIndex={selectedIndex}
      />
    );
  }
}

export const SuggestionsPropTypes = PropTypes.shape({
  view: PropTypes.instanceOf(EditorView),
  getOptions: PropTypes.func,
  onSelect: PropTypes.func,
  renderMenuItem: PropTypes.func
}).isRequired;

Suggestions.propTypes = SuggestionsPropTypes;

export default Suggestions;
