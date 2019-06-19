import Icon from '@material-ui/icons/Edit';

import { view, type } from './defs';
import Pad from './Pad';

export default {
  name: 'prosemirror',
  title: 'ProsemirrorPad',
  type,
  view,
  main: Pad,
  icon: Icon
};
