//
// Copyright 2019 Wireline, Inc.
//

export const CONTENT_KEY = 'xmlfragment_content_v1';

export const getXmlFragmentContent = doc => doc.getXmlFragment(CONTENT_KEY);

export const getContentAsMarkdown = () => '## HOLA';
