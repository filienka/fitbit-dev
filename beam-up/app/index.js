import clock from "clock";
const messaging = require('messaging');

import * as data from './data';
import * as db from '../common/db';
import * as ui from '../common/ui';

const APP_NAME = 'BeamUp';  // Do not change without migration

let chosenColor = '';

const update = (date) => {
  const hours = date.getHours();
  const mins = date.getMinutes();
  
  ui.get('background').style.fill = chosenColor;
  
  ui.get('h0').href = data.getTimePath(Math.floor(hours / 10));
  ui.get('h1').href = data.getTimePath(hours % 10);
  ui.get('m0').href = data.getTimePath(Math.floor(mins / 10));
  ui.get('m1').href = data.getTimePath(mins % 10);
  
  const dom = date.getDate();
  ui.get('d0').href = data.getDatePath(Math.floor(dom / 10));
  ui.get('d1').href = data.getDatePath(dom % 10);
  
  const day = date.getDay();
  ui.get('day').href = data.getDayPath(day);
};

const onMessage = (event) => {
  data.setColor(event.data.color);
  
  chosenColor = data.loadColor();
  console.log(`Chosen color: ${chosenColor}`);
  update(new Date());
};

(() => {
  console.log('Beam Up');

  db.load(APP_NAME);
  chosenColor = data.loadColor();
  
  clock.granularity = 'minutes';
  clock.ontick = event => update(event.date);
  update(new Date());
  
  messaging.peerSocket.onmessage = onMessage;
})();
