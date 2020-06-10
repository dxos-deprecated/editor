//
// Copyright 2020 Wireline, Inc.
//

import { Plugin, PluginKey } from 'prosemirror-state';
import { undo, redo } from 'prosemirror-history';
import { undo as yUndo, redo as yRedo, yUndoPluginKey } from '../plugins/yjs-undo-plugin';
import { EventEmitter } from 'events';

class YjsHistory extends EventEmitter {
  _undoManager = undefined;

  init (state) {
    this._undoManager = yUndoPluginKey.getState(state).undoManager;
    this._undoManager.on('stack-item-added', this.historyUpdated);
    this._undoManager.on('stack-item-popped', this.historyUpdated);
  }

  historyUpdated = () => {
    const canUndo = this._undoManager.undoStack.length > 0;
    const canRedo = this._undoManager.redoStack.length > 0;

    this.emit('update', {
      canUndo,
      canRedo
    });
  }

  destroy () {
    this._undoManager.off('stack-item-added', this.historyUpdated);
    this._undoManager.off('stack-item-popped', this.historyUpdated);
  }

  update () { }

  undo (state) {
    return yUndo(state);
  }

  redo (state) {
    return yRedo(state);
  }
}

class History extends EventEmitter {
  init () { }

  destroy () { }

  update (view) {
    this.emit('update', {
      canUndo: this.undo(view.state),
      canRedo: this.redo(view.state)
    });
  }

  undo (state, dispatch) {
    return undo(state, dispatch);
  }

  redo (state, dispatch) {
    return redo(state, dispatch);
  }
}

export const historyListenerPluginKey = new PluginKey('history-listener');

const historyListenerPlugin = (config = { yjsHistory: false }) => {
  return new Plugin({
    key: historyListenerPluginKey,

    state: {
      init () {
        const history = config.yjsHistory ? new YjsHistory() : new History();

        return {
          history,
          canUndo: false,
          canRedo: false
        };
      },
      apply (tr, value) {
        return value;
      }
    },

    view (view) {
      const { history } = historyListenerPluginKey.getState(view.state);
      history.init(view.state);

      return {
        update (view) {
          const { history } = historyListenerPluginKey.getState(view.state);

          if (history) {
            history.update(view);
          }
        },
        destroy () {
          const { history } = historyListenerPluginKey.getState(view.state);
          history.destroy();
        }
      };
    }
  });
};

export default historyListenerPlugin;
