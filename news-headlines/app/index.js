import document from 'document';

import * as comm from '../common/comm';
import * as log from '../common/log';
import * as ui from '../common/ui';

const TIMEOUT_MS = 10000;

const stories = [];
let loadingWindow, mainWindow;
let currentStory = 0;
let buttonsEnabled = false;
let timeoutHandle;

const setupUI = () => {
  loadingWindow = new ui.Window({
    id: 'loading-window',
    setup: () => {
      ui.setVisible('loading-text', true);
      ui.setText('loading-text', 'Waiting for phone...');
    }
  });
  loadingWindow.show();
  
  mainWindow = new ui.Window({
    id: 'main-window', 
    setup: () => {
      ui.get('main-title').onclick = () => {
        detailWindow.show();
        detailWindow.update();
        ui.animate('detail-card-instance');
        buttonsEnabled = false;
      };
    }, 
    update: () => {
      const story = stories[currentStory];
      ui.setText('main-progress', `${currentStory + 1}/${stories.length}`);
      ui.setText('main-title', story.title);
    }
  });
  
  const detailWindow = new ui.Window({
    id: 'detail-window',
    update: () => {
      const story = stories[currentStory];
      ui.setText('detail-title', story.title);

      const detailText = ui.get('detail-text');
      detailText.text = story.description;
      detailText.onclick = () => {
        detailWindow.hide();
        mainWindow.show();
        buttonsEnabled = true;
      };
    }
  });
};

const setupMessaging = () => {
  comm.setup({
    open: () => log.info('Device socket open'),
    message: (event) => {
      if(stories.length === 0) {
        clearTimeout(timeoutHandle);
        loadingWindow.hide();
        mainWindow.show();
        buttonsEnabled = true;
      }

      stories.push(event.data);
      mainWindow.update();
    },
    error: (err) => {
      log.error(`Device connection error: ${err.code} - ${err.message}`);
      ui.setVisible('loading-text', true);
    }
  });
}

const setupButtons = () => {
  document.onkeypress = (e) => {
    if(!buttonsEnabled) return;
    
    switch(e.key) {
      case 'up': 
        if(currentStory === 0) return;
        
        currentStory--; 
        ui.animate('main-card-instance');
        break;
      case 'down': 
        if(currentStory === stories.length - 1) return;
        
        currentStory++; 
        ui.animate('main-card-instance');
        break;
      default: break;
    }

    mainWindow.update();
  };
};

const setupTimeout = () => {
  timeoutHandle = setTimeout(() => {
    ui.setVisible('loading-text', true);
    ui.setText('loading-text', 'Download failed!');
  }, TIMEOUT_MS);
};

(() => {
  setupUI();
  setupButtons();
  setupMessaging();
  setupTimeout();
})();
