# Sync example

This example shows how to sync a document with some content.

## Scenario
 - One shared `Document`.
 - Two peers: `P1` and `P2`.

## Flow
```
1. P1 creates a LOCAL Document ==> D1
2. P1 subscribes to remote changes
3. P1 shares initial state ==> D1.state                       MSG: { update: D1.state }
4. P1 changes D1 ==> CH1
5. P1 shares changes CH1                                      MSG: { update: CH1 }
6. P2 wants to edit D1
7. P2 subscribes to remote changes
8. P2 applies previous updates including initial D1 state
9. P2 shares diff state between D1 and D2                     MSG: { update: diff(D1, D2) }
10. P1 and P2 change they local Document
11. P1 and P2 share changes
```

## Example
```javascript
const EventEmitter = require('events');
const assert = require('assert');

const uuid = require('uuid/v4');

const { Document, XmlFragmentHelpers } = require('@wireline/document');

const msgs = {
  _msgs: [],
  _events: new EventEmitter(),

  append(msg) {
    this._msgs.push(msg);
    this._events.emit('msg', msg);

    console.log('MSGS');
    console.log(this._msgs.map(({ origin: { author, ...rest } }) => JSON.stringify({ author, ...rest })).join('\n'), '\n');
  },

  subscribe(cb) {
    this._events.addListener('msg', cb);
  },

  getMessages() {
    return this._msgs;
  }
};

const makePeer = () => {
  const peer = {
    id: uuid(),
    document: new Document(),
    onMessage(msg) {
      if (msg.origin.author === this.id) return;
      this.document.applyUpdate(msg.update, msg.origin);
    }
  };

  peer.document.on('update', ({ update, origin }) => {
    if (origin.author !== peer.id || origin.init) return; // remote
    msgs.append({ update, origin });
  });

  msgs.subscribe(peer.onMessage.bind(peer));

  return peer;
};

let chCount = 0;
const makeAChange = peer => {
  const paragraph = XmlFragmentHelpers.paragraph(`--CHANGE ${++chCount}--`);

  peer.document.content.insert(peer.document.content.length, [paragraph], { author: peer.id });
};

// start flow
const p1 = makePeer();

msgs.append({ update: Document.encode(p1.document), origin: { author: p1.id, create: true } });

makeAChange(p1);

const p2 = makePeer();

msgs.getMessages().forEach(msg => {

  if (msg.origin.create) {
    const remoteDoc = Document.decode(msg.update);
    const localDocUpdate = p2.document.updateDiff(remoteDoc);
    msgs.append({ update: localDocUpdate, origin: { author: p2.id } });

    p2.document.applyUpdate(remoteDoc.docState, { author: p2.id, init: true });
  } else {
    p2.document.applyUpdate(msg.update, { author: p2.id, init: true });
  }
});

makeAChange(p2);
makeAChange(p1);
makeAChange(p1);
makeAChange(p2);

assert(p2.document.content.equals(p1.document.content));
```
