import Controls from './Controls.js';
import Content from './Content.js';

export default class Editor {
  constructor(config) {
    this.content = new Content(config.content.contenteditable);
    this.controls = config.buttons.map(button => {
      return new Controls[button.command](button.element, this.content.shared);
    });
  }
}
