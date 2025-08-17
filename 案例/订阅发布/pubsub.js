class PubSub {
  constructor(options = {}) {
    // 默认全局配置
    const defaultConfig = {
      maxHistory: 5,
      messageTimeout: 15000,
      broadcastMode: 'multicast',
      maxConsumption: null,
      historyEnabled: true,
      publisherName: '系统发布者'
    };

    // 合并用户传入的全局配置
    this.globalConfig = { ...defaultConfig, ...options };
    this.topics = new Map();
    this.ackCallbacks = new Map();
    this.subscribers = new Map();
    this.messageCounter = 0;
  }

  /**
   * 更新全局配置
   * @param {Object} newConfig 新的全局配置
   */
  updateGlobalConfig (newConfig) {
    this.globalConfig = { ...this.globalConfig, ...newConfig };
  }

  /**
   * 订阅主题
   * @param {string} topic 主题名称
   * @param {Function} callback 回调函数
   * @param {Object} options 选项
   */
  subscribe (topic, callback, options = {}) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, {
        subscribers: new Map(),
        history: [],
        config: { ...this.globalConfig }
      });
    }

    const topicInfo = this.topics.get(topic);
    const subscriberId = options.subscriberId || `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // 保存订阅者
    topicInfo.subscribers.set(subscriberId, {
      callback,
      options: {
        replayHistory: this.globalConfig.historyEnabled,
        ...options
      }
    });

    // 存储全局订阅者引用
    this.subscribers.set(subscriberId, { topic, callback });

    // 回放历史消息
    if (topicInfo.subscribers.size === 1 && topicInfo.history.length > 0) {
      this._replayHistory(topic, subscriberId);
    }

    return subscriberId;
  }

  /**
   * 发布消息
   * @param {string} topic 主题名称
   * @param {*} message 消息内容
   * @param {Object} localOptions 局部选项（可选）
   */
  publish (topic, message, localOptions = {}, ackCallback) {
    if (!this.topics.has(topic)) {
      this.topics.set(topic, {
        subscribers: new Map(),
        history: [],
        config: { ...this.globalConfig }
      });
    }

    const topicInfo = this.topics.get(topic) 

    const messageId = `msg-${this.messageCounter++}`;
    const timestamp = Date.now();

    // 合并配置：全局配置 + 发布时局部配置
    const mergedOptions = {
      ...this.globalConfig,
      ...localOptions,
      publisherName: localOptions.publisherName || this.globalConfig.publisherName
    };

    const messageData = {
      id: messageId,
      topic,
      message,
      timestamp,
      publisher: mergedOptions.publisherName,
      options: mergedOptions,
      consumedCount: 0,
      consumers: [],
      consumed: false,// 是否已消费
    };

    // 保存ACK回调
    // const ackCallback = (ackInfo) => {
    //   if (this.ackCallbacks.has(messageId)) {
    //     this.ackCallbacks.get(messageId)(ackInfo);
    //   }
    // };
    // 存储ACK回调
    if (typeof ackCallback === 'function') {
      this.ackCallbacks.set(messageId, ackCallback);
    }

    // 如果有订阅者，立即投递
    if (topicInfo.subscribers.size > 0) {
      this._deliverMessage(topic, messageData);
    } else {
      // 存储为历史消息
      this._addToHistory(topicInfo, messageData);
    }

    return messageId;
  }

  /**
   * 投递消息给订阅者
   * @param {string} topic 主题名称
   * @param {Object} messageData 消息数据
   */
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

  /**
   * 投递给指定订阅者
   * @param {string} subscriberId 订阅者ID
   * @param {Object} subscriber 订阅者
   * @param {Object} messageData 消息数据
   */
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

  /**
   * 添加到历史记录
   * @param {Object} topicInfo 主题信息
   * @param {Object} messageData 消息数据
   */
  _addToHistory (topicInfo, messageData) {
    const { history } = topicInfo;
    const maxHistory = messageData.options.maxHistory || 5;

    if (messageData.options.messageTimeout > 0) {
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
      }, messageData.options.messageTimeout);
    }

    if (history.length >= maxHistory) {
      const removed = history.shift();
      if (removed?.timeoutId) clearTimeout(removed.timeoutId);
    }

    history.push(messageData);
  }

  /**
   * 回放历史消息给订阅者
   * @param {string} topic 主题名称
   * @param {string} subscriberId 订阅者ID
   */
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
          message: messageData.message,
          topic,
          publishTime: messageData.timestamp,
          consumeTime: Date.now(),
          result,
          isHistory: true
        };

        if (this.ackCallbacks.has(messageData.id)) {
          this.ackCallbacks.get(messageData.id)(ackInfo);
          this.ackCallbacks.delete(messageData.id);
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

  /**
   * 取消订阅
   * @param {string} topic 主题名称
   * @param {string} subscriberId 订阅者ID
   */
  unsubscribe (topic, subscriberId) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    if (topicInfo.subscribers.has(subscriberId)) {
      topicInfo.subscribers.delete(subscriberId);
      this.subscribers.delete(subscriberId);
    }
  }

  /**
   * 清除主题历史记录
   * @param {string} topic 主题名称
   */
  clearHistory (topic) {
    const topicInfo = this.topics.get(topic);
    if (!topicInfo) return;

    topicInfo.history.forEach(msg => {
      if (msg.timeoutId) clearTimeout(msg.timeoutId);
    });

    topicInfo.history = [];
  }

  /**
   * 获取主题信息
   * @param {string} topic 主题名称
   */
  getTopicInfo (topic) {
    if (!this.topics.has(topic)) return null;
    const topicInfo = this.topics.get(topic);
    return {
      subscribers: topicInfo.subscribers.size,
      pendingMessages: topicInfo.history.length
    };
  }

  /**
   * 重置系统
   */
  reset () {
    this.topics.clear();
    this.ackCallbacks.clear();
    this.subscribers.clear();
    this.messageCounter = 0;
  }
}