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
    this._debouncedSend = debounce(this._send, this.sendDebounce, { leading: sendDebounceLeading });
  }

  receive(data) {
    if (this.debug) { console.log(`CHANNEL(${this.debug}).receive`, data); }
    this.emit('remote', data);
  }

  send(data) {
    if (this.sendDebounce) {
      return this._debouncedSend(data);
    }

    this._send(data);
  }

  _send(data) {
    if (this.debug) { console.log(`CHANNEL(${this.debug}).send`, data); }
    this.emit('sended', data);
    this.emit('local', data);
  }
}

export default Channel;
