/**
 * TODO - Saving text to DB
 * TODO - Deleting of note from noteView
 * TODO - Opening of NotesList from NoteView
 * TODO - Context Menu Logic
 * TODO - Improve note placement logic on creation
 * TODO - Improve note placement logic on load
 * TODO - Adding of images and saving to local storage
 * TODO - Secondary popup view for confirm on delete, insert image, insert link
 * TODO - Text highlighting to be the same as color theme
 * TODO - Double click on task bar to open in full window
 * TODO - Revise min width and max-width of NoteView and ControlsView
 * TODO - NoteView Panels layout is faulty when resized - Revise
 * TODO - Add logic for when toolbar should appear or disappear
 * TODO - In CSS, toolbar buttons should be highlighted when active
 * TODO - Buttons should only be active when selection has the command applied
 *        todo - check document.queryCommandState()
 * TODO - Adjust z-index on WindowView close
 */
import { default as Model } from './Model.js';
import { default as View } from './View.js';
import Controller from './Controller.js';
import LocalRepository from './DataAccess.js';

try {
  const db = new LocalRepository();
  const model = new Model(db);
  const view = new View(model.getApplicationData());
  const controller = new Controller(model, view);
  controller.wireUp();
} catch (err) {
  console.error(err);
}
