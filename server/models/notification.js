// server/models/notification.js

module.exports = (sequelize, DataTypes) => {
  const Notification = sequelize.define("Notification", {
    type: {
      type: DataTypes.ENUM('reminder', 'overdue', 'bump', 'friend_request', 'friend_accepted', 'completed'),
      allowNull: false,
    },

    message: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },

    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    // Reference to related entity (task, friend request, etc.)
    referenceId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    referenceType: {
      type: DataTypes.STRING,
      allowNull: true, // 'task', 'friend', 'bump'
    },
  });

  Notification.associate = (models) => {
    // User who receives the notification
    Notification.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
    });
    
    // User who triggered the notification (for bumps, friend requests, etc.)
    Notification.belongsTo(models.User, {
      foreignKey: "fromUserId",
      as: "fromUser",
    });
  };

  return Notification;
};
