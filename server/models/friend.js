// server/models/friend.js

module.exports = (sequelize, DataTypes) => {
  const Friend = sequelize.define("Friend", {
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
      allowNull: false,
      defaultValue: 'pending',
    },
  });

  Friend.associate = (models) => {
    // The user who sent the friend request
    Friend.belongsTo(models.User, {
      foreignKey: "requesterId",
      as: "requester",
    });
    
    // The user who received the friend request
    Friend.belongsTo(models.User, {
      foreignKey: "addresseeId",
      as: "addressee",
    });
  };

  return Friend;
};
