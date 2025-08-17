// 创建PubSub实例
const pubsub = new PubSub();

// 日志记录函数
function logPublish (message, type = 'realtime') {
  const now = new Date();
  const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.innerHTML = `<span class="log-time">${timeString}</span> ${message}`;

  const publishLog = document.getElementById('publishLog');
  publishLog.appendChild(logEntry);
  publishLog.scrollTop = publishLog.scrollHeight;
}

function logSubscribe (message, type = 'history') {
  const now = new Date();
  const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

  const logEntry = document.createElement('div');
  logEntry.className = `log-entry ${type}`;
  logEntry.innerHTML = `<span class="log-time">${timeString}</span> ${message}`;

  const subscribeLog = document.getElementById('subscribeLog');
  subscribeLog.appendChild(logEntry);
  subscribeLog.scrollTop = subscribeLog.scrollHeight;
}

function logSystem (message) {
  const now = new Date();
  const timeString = `[${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}]`;

  const logEntry = document.createElement('div');
  logEntry.className = 'log-entry system';
  logEntry.innerHTML = `<span class="log-time">${timeString}</span> ${message}`;

  const systemLog = document.getElementById('systemLog');
  systemLog.appendChild(logEntry);
  systemLog.scrollTop = systemLog.scrollHeight;
}

// 更新主题信息
function updateTopicInfo () {
  const sportsInfo = pubsub.getTopicInfo('news.sports') || { subscribers: 0, pendingMessages: 0 };
  const weatherInfo = pubsub.getTopicInfo('weather.update') || { subscribers: 0, pendingMessages: 0 };

  document.getElementById('sportsSubCount').textContent = sportsInfo.subscribers;
  document.getElementById('sportsPendingCount').textContent = sportsInfo.pendingMessages;
  document.getElementById('weatherSubCount').textContent = weatherInfo.subscribers;
  document.getElementById('weatherPendingCount').textContent = weatherInfo.pendingMessages;
}

// DOM元素引用
const broadcastMode = document.getElementById('broadcastMode');
const maxConsumptionContainer = document.getElementById('maxConsumptionContainer');
const updateGlobalConfigBtn = document.getElementById('updateGlobalConfig');

// 广播模式切换
broadcastMode.addEventListener('change', () => {
  maxConsumptionContainer.style.display =
    broadcastMode.value === 'limited' ? 'block' : 'none';
});

// 更新全局配置
updateGlobalConfigBtn.addEventListener('click', () => {
  const newConfig = {
    maxHistory: parseInt(document.getElementById('globalMaxHistory').value) || 5,
    messageTimeout: parseInt(document.getElementById('globalTimeout').value) || 15000,
    broadcastMode: document.getElementById('globalBroadcastMode').value,
    maxConsumption: document.getElementById('globalBroadcastMode').value === 'limited' ?
      parseInt(document.getElementById('globalMaxConsumption').value) || 3 : null,
    historyEnabled: document.getElementById('globalHistoryEnabled').checked,
    publisherName: document.getElementById('globalPublisherName').value || '系统发布者'
  };

  pubsub.updateGlobalConfig(newConfig);
  logSystem(`全局配置已更新: 
        maxHistory=${newConfig.maxHistory}, 
        timeout=${newConfig.messageTimeout}ms, 
        broadcastMode=${newConfig.broadcastMode}`);
});

// 消息发布
document.getElementById('publishBtn').addEventListener('click', () => {
  const topic = document.getElementById('topic').value;
  const message = document.getElementById('message').value;

  // 获取本地配置
  const localConfig = {
    broadcastMode: broadcastMode.value === '' ?
      pubsub.globalConfig.broadcastMode : broadcastMode.value
  };

  // 如果有覆盖配置，优先使用
  if (document.getElementById('historySize').value) {
    localConfig.maxHistory = parseInt(document.getElementById('historySize').value);
  }

  if (document.getElementById('messageTimeout').value) {
    localConfig.messageTimeout = parseInt(document.getElementById('messageTimeout').value);
  }

  // 发布消息
  const messageId = pubsub.publish(topic, message, localConfig, (ackInfo) => {
    const type = ackInfo.status === 'timeout' ? 'warning' : 'ack';
    logPublish(`${type === 'warning' ? '⏰ 消息超时' : '✅ 已消费'}: 
            ${ackInfo.message.substring(0, 30)}...
            (订阅者: ${ackInfo.subscriberId || '无'})`, type);
  });

  logPublish(`发布消息成功: ${message.substring(0, 30)}... (ID: ${messageId})`);
  updateTopicInfo();
});

// 无订阅者消息发布
document.getElementById('publishNoSubBtn').addEventListener('click', () => {
  const topic = 'weather.update';
  const message = '今日天气: 晴天, 气温25℃';
  document.getElementById('topic').value = topic;
  document.getElementById('message').value = message;

  const messageId = pubsub.publish(topic, message);
  logPublish(`发布消息到无订阅者主题: ${message.substring(0, 30)}... (ID: ${messageId})`, 'warning');
  updateTopicInfo();
});

// 创建订阅者
document.getElementById('subscribeBtn').addEventListener('click', () => {
  const topic = document.getElementById('subTopic').value;
  const subscriberId = document.getElementById('subscriberId').value || undefined;
  const replayHistory = document.getElementById('replayHistory').checked;

  const subscriptionId = pubsub.subscribe(
    topic,
    (message, ack, meta) => {
      const type = meta.isHistory ? 'history' : 'realtime';
      logSubscribe(
        `${meta.isHistory ? '🕰️ 历史消息' : '⚡ 实时消息'}: 
                ${message.substring(0, 30)}... 
                (来自: ${meta.publisher}, ID: ${meta.id})`,
        type
      );
      ack('成功处理');
    },
    {
      subscriberId,
      replayHistory
    }
  );

  logSubscribe(`订阅者创建成功: ${subscriberId || subscriptionId} (主题: ${topic})`, 'system');
  updateTopicInfo();
});

// 演示功能
document.getElementById('demoGlobalConfig').addEventListener('click', () => {
  // 设置全局配置
  pubsub.updateGlobalConfig({
    maxHistory: 3,
    messageTimeout: 10000
  });

  // 发布消息（使用全局配置）
  pubsub.publish('demo.topic', '使用全局配置的消息', {});

  logSystem('演示: 已设置全局配置 maxHistory=3, timeout=10000ms');
  logSystem('发布消息: 使用全局配置的消息');
});

document.getElementById('demoConfigMerge').addEventListener('click', () => {
  // 发布消息（使用全局和局部配置）
  pubsub.publish(
    'demo.topic',
    '合并配置的消息',
    {
      maxHistory: 2,
      publisherName: '特殊发布者'
    }
  );

  logSystem('演示: 全局配置 + 发布配置 = 最终配置');
  logSystem('发布消息: 合并配置的消息 (覆盖maxHistory=2)');
});

document.getElementById('demoLocalOverride').addEventListener('click', () => {
  // 覆盖全局配置
  pubsub.updateGlobalConfig({
    broadcastMode: 'single',
    maxHistory: 5
  });

  // 发布消息（使用局部配置覆盖）
  pubsub.publish(
    'demo.topic',
    '局部覆盖配置的消息',
    {
      broadcastMode: 'multicast',
      publisherName: '测试发布者'
    }
  );

  logSystem('演示: 局部配置覆盖全局配置');
  logSystem('发布消息: 局部覆盖配置的消息 (覆盖broadcastMode=multicast)');
});

document.getElementById('demoMessageLifetime').addEventListener('click', () => {
  // 更新全局配置
  pubsub.updateGlobalConfig({
    maxHistory: 3,
    messageTimeout: 15000,
    broadcastMode: 'multicast'
  });

  // 发布几条消息
  pubsub.publish('demo.lifecycle', '生命周期消息1');
  pubsub.publish('demo.lifecycle', '生命周期消息2');
  pubsub.publish('demo.lifecycle', '生命周期消息3');

  // 创建订阅者
  pubsub.subscribe('demo.lifecycle', (msg, ack) => {
    logSubscribe(`消费消息: ${msg.substring(0, 20)}...`, 'realtime');
    ack('ACK确认');
  });

  logSystem('演示: 消息生命周期演示 (发布3条消息)');
  logSystem('创建订阅者消费历史消息');
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
  logSystem('系统启动: PubSub消息系统已就绪');
  logSystem('默认全局配置: maxHistory=5, messageTimeout=15000, broadcastMode=multicast');
  updateTopicInfo();

  // 设置初始全局配置值
  document.getElementById('globalMaxHistory').value = 5;
  document.getElementById('globalTimeout').value = 15000;
  document.getElementById('globalPublisherName').value = '系统发布者';
});