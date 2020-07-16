import { loremIpsum } from 'lorem-ipsum';

export const lorem = count => loremIpsum({
  format: 'html',
  count,
  units: 'paragraphs'
});
