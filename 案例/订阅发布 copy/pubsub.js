class PubSub {
  constructor() {
    this.topics = new Map();
    this.ackCallbacks = new Map();
    this.subscribers = new Map();
    this.messageCounter = 0;
  }

  subscribe (topic, callback, options = {}) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, {
        subscribers: new Map(),
        history: [],
        config: {
          maxHistory: 5,
          messageTimeout: 15000,
        }
      });
    }

    const topicInfo = this.topics.get(topic);
    const subscriberId = options.subscriberId || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    topicInfo.subscribers.set(subscriberId, {
      callback,
      options: {
        replayHistory: true,
        ...options
      }
    });

    this.subscribers.set(subscriberId, { topic, callback });

    if (options.replayHistory !== false && topicInfo.history.length > 0) {
      this._replayHistory(topic, subscriberId);
    }

    return subscriberId;
  }

  publish (topic, message, options = {}, ackCallback) {
    if (!this.topics.has(topic)) { 
      this.topics.set(topic, {
        subscribers: new Map(),
        history: [],
        config: {
          maxHistory: 5,
          messageTimeout: 15000,
        }
      })
    }

    const topicInfo = this.topics.get(topic);

    const messageId = `msg-${this.messageCounter++}`;
    const timestamp = Date.now();

    const messageData = {
      id: messageId,
      topic,
      message,
      timestamp,
      publisher: "系统发布者",
      options: {
        broadcastMode: 'multicast',
        maxConsumption: null,
        historySize: 5,
        timeout: 15000,
        ...options
      },
      consumedCount: 0,
      consumers: []
    };

    // const ackCallback = (ackInfo) => {
    //   if (this.ackCallbacks.has(messageId)) {
    //     this.ackCallbacks.get(messageId)(ackInfo);
    //   }
    // };
    // 存储ACK回调
    if (typeof ackCallback === 'function') {
      this.ackCallbacks.set(messageId, ackCallback);
    }
    //this.ackCallbacks.set(messageId, ackCallback);

    if (topicInfo.subscribers.size > 0) {
      this._deliverMessage(topic, messageData);
    } else {
      this._addToHistory(topicInfo, messageData);
    }

    return messageId;
  }

  _deliverMessage (topic, messageData) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    const { subscribers } = topicInfo;
    const { broadcastMode, maxConsumption } = messageData.options;

    if (broadcastMode === 'single') {
      const firstSubscriber = subscribers.entries().next().value;
      if (firstSubscriber) {
        const [subscriberId, subscriber] = firstSubscriber;
        this._deliverToSubscriber(subscriberId, subscriber, messageData);
      }
      return;
    }

    const remainingConsumption = maxConsumption === null ? Infinity : maxConsumption - messageData.consumedCount;

    let count = 0;
    for (const [subscriberId, subscriber] of subscribers) {
      if (count >= remainingConsumption) break;

      if (messageData.consumers.includes(subscriberId)) continue;

      this._deliverToSubscriber(subscriberId, subscriber, messageData);
      messageData.consumers.push(subscriberId);
      count++;

      messageData.consumedCount++;
      if (messageData.consumedCount >= remainingConsumption) break;
    }
  }

  _deliverToSubscriber (subscriberId, subscriber, messageData) {
    const ack = (result) => {
      const ackInfo = {
        subscriberId,
        messageId: messageData.id,
        topic: messageData.topic,
        message: messageData.message,
        publishTime: messageData.timestamp,
        consumeTime: Date.now(),
        result
      };

      if (this.ackCallbacks.has(messageData.id)) {
        this.ackCallbacks.get(messageData.id)(ackInfo);
      }
    };

    try {
      subscriber.callback(messageData.message, ack, messageData);
    } catch (error) {
      ack({ error: error.message });
    }
  }

  _addToHistory (topicInfo, messageData) {
    const { history } = topicInfo;
    const maxHistory = messageData.options.historySize || 5;

    if (messageData.options.timeout > 0) {
      messageData.timeoutId = setTimeout(() => {
        if (this.ackCallbacks.has(messageData.id)) {
          const ackInfo = {
            status: 'timeout',
            messageId: messageData.id,
            message: messageData.message,
            topic: messageData.topic,
            publishTime: messageData.timestamp,
            timeoutTime: Date.now()
          };
          this.ackCallbacks.get(messageData.id)(ackInfo);

          const index = history.findIndex(msg => msg.id === messageData.id);
          if (index !== -1) {
            history.splice(index, 1);
          }

          this.ackCallbacks.delete(messageData.id);
        }
      }, messageData.options.timeout);
    }

    if (history.length >= maxHistory) {
      const removed = history.shift();
      if (removed?.timeoutId) clearTimeout(removed.timeoutId);
    }

    history.push(messageData);
  }

  _replayHistory (topic, subscriberId) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    const subscriber = topicInfo.subscribers.get(subscriberId);
    if (!subscriber) return;

    topicInfo.history.forEach(messageData => {
      const ack = (result) => {
        const ackInfo = {
          subscriberId,
          messageId: messageData.id,
          topic,
          publishTime: messageData.timestamp,
          consumeTime: Date.now(),
          result,
          isHistory: true
        };

        if (this.ackCallbacks.has(messageData.id)) {
          this.ackCallbacks.get(messageData.id)(ackInfo);
        }
      };

      try {
        subscriber.callback(messageData.message, ack, {
          ...messageData,
          isHistory: true
        });
      } catch (error) {
        ack({ error: error.message });
      }
    });
  }

  unsubscribe (topic, subscriberId) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    if (topicInfo.subscribers.has(subscriberId)) {
      topicInfo.subscribers.delete(subscriberId);
      this.subscribers.delete(subscriberId);
    }
  }

  clearHistory (topic) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    topicInfo.history.forEach(msg => {
      if (msg.timeoutId) clearTimeout(msg.timeoutId);
    });

    topicInfo.history = [];
  }

  getTopicInfo (topic) {
    if (!this.topics.has(topic)) return null;
    const topicInfo = this.topics.get(topic);
    return {
      subscribers: topicInfo.subscribers.size,
      pendingMessages: topicInfo.history.length
    };
  }
}