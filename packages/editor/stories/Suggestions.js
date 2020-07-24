//
// Copyright 2020 DXOS.org
//

import React, { Component } from 'react';

import { Editor } from '../src';

class Suggestions extends Component {
  handleGetOptions = (query = '') => {
    return [
      { id: 1, label: 'Ana' },
      { id: 2, label: 'María' },
      { id: 3, label: 'Roberto' },
      { id: 4, label: 'Juan' }
    ].filter(option => option.label.toLowerCase().includes(query.toLowerCase()));
  };

  handleSelect = (option, { replaceWith }) => {
    const title = `@${option.label}`;

    replaceWith(title, {
      title,
      href: title
    });
  };

  handleRenderItem = (option) => {
    return `${option.id} - ${option.label}`;
  };

  handleKeyDown = ({ key }) => {
    console.log('Handle Key Down triggered');
    if (key === 'Enter') {
      console.log('Enter pressed');
      return true;
    }

    return false;
  };

  render () {
    return (
      <Editor
        onKeyDown={this.handleKeyDown}
        suggestions={{
          getOptions: this.handleGetOptions,
          onSelect: this.handleSelect,
          renderMenuItem: this.handleRenderItem
        }}
      />
    );
  }
}

export default Suggestions;
