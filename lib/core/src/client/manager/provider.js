import { location } from 'global';
import qs from 'qs';
import React from 'react';
import { Provider } from '@storybook/ui';
import addons from '@storybook/addons';
import createChannel from '@storybook/channel-postmessage';
import Events from '@storybook/core-events';
import Preview from './preview';

export default class ReactProvider extends Provider {
  constructor() {
    super();
    this.channel = createChannel({ page: 'manager' });
    addons.setChannel(this.channel);

    this.channel.emit(Events.CHANNEL_CREATED);
  }

  getPanels() {
    return addons.getPanels();
  }

  renderPreview(selectedKind, selectedStory) {
    const queryParams = {
      selectedKind,
      selectedStory,
    };

    // Add the react-perf query string to the iframe if that present.
    if (/react_perf/.test(location.search)) {
      queryParams.react_perf = '1';
    }

    const queryString = qs.stringify(queryParams);
    const url = `iframe.html?${queryString}`;
    return <Preview url={url} />;
  }

  handleAPI(api) {
    api.onStory((kind, story) => {
      this.channel.emit(Events.SET_CURRENT_STORY, { kind, story });
    });
    this.channel.on(Events.SET_STORIES, data => {
      api.setStories(data.stories);
    });
    this.channel.on(Events.SELECT_STORY, data => {
      api.selectStory(data.kind, data.story);
    });
    this.channel.on(Events.APPLY_SHORTCUT, data => {
      api.handleShortcut(data.event);
    });
    addons.loadAddons(api);
  }
}
