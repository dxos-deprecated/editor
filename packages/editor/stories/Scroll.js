import React from 'react';

import { Editor } from '../src';
import { lorem } from './util';

const Scroll = () => {
  const initialContent = lorem(10);

  return (
    <div style={{
      flex: 1,
      width: 800,
      margin: 'auto',
      display: 'flex',
      maxWidth: 1000
    }}
    >
      <Editor initialContent={initialContent} toolbar schema='full' />
    </div>
  );
};

export default Scroll;
