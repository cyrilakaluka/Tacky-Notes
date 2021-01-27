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
