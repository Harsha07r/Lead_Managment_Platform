const logActivity = (targetType, targetId, action, details, actor = 'system') => ({
  actor,
  action,
  targetType,
  targetId,
  details,
  createdAt: new Date(),
});

module.exports = { logActivity };
