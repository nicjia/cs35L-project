// server/models/tasks.js

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define("Task", {
    // 'id' is created automatically

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    done: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "Medium",
    },

    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: false, //or true depending on preference
    },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "UserId",
      as: "user",
    });
  };

  return Task;
};
