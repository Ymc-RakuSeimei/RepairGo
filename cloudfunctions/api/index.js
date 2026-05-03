const cloud = require('wx-server-sdk');
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

const handlers = {};
const fs = require('fs');
const path = require('path');

// Auto-load all handlers
const handlersPath = path.join(__dirname, 'handlers');
if (fs.existsSync(handlersPath)) {
  const files = fs.readdirSync(handlersPath);
  for (const file of files) {
    if (file.endsWith('.js')) {
      const name = file.replace('.js', '');
      handlers[name] = require(path.join(handlersPath, file));
    }
  }
}

exports.main = async (event, context) => {
  const { action, ...data } = event;
  
  if (!action) {
    return { code: -1, message: 'action is required' };
  }
  
  const handler = handlers[action];
  if (!handler || typeof handler.main !== 'function') {
    return { code: -1, message: `handler ${action} not found` };
  }
  
  try {
    return await handler.main(data, context);
  } catch (err) {
    console.error(`Error in ${action}:`, err);
    return { code: -1, message: 'Internal Server Error' };
  }
};
