//
// Copyright 2019 Wireline, Inc.
//

import { EventEmitter } from 'events';
import debounce from 'lodash.debounce';

class Channel extends EventEmitter {
  constructor({
    sendDebounce = 0,
    sendDebounceLeading = false,
    debug = false
  } = {}) {
    super();

    this.debug = debug;
    this.sendDebounce = sendDebounce;
    this._debouncedSend = debounce(this._send, this.sendDebounce, {
      leading: sendDebounceLeading
    });
    this._paused = false;
  }

  receive(data) {
    if (this.debug) {
      console.log(`CHANNEL(${this.debug}).receive`, data);
    }
    this._emit('remote', data);
  }

  send(data) {
    if (this.sendDebounce) {
      return this._debouncedSend(data);
    }

    this._send(data);
  }

  resume() {
    this._paused = false;
  }

  pause() {
    this._paused = true;
  }

  _send(data) {
    if (this.debug) {
      console.log(`CHANNEL(${this.debug}).send`, data);
    }
    this._emit('sended', data);
    this._emit('local', data);
  }

  _emit(event, data) {
    if (this._paused) return;

    this.emit(event, data);
  }
}

export default Channel;
