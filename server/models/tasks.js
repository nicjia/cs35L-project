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

    ProjectId: {
      type: DataTypes.INTEGER,
      allowNull: true, // null means not in any project (general task)
      references: {
        model: "Projects",
        key: "id",
      },
    },
  });

  Task.associate = (models) => {
    Task.belongsTo(models.User, {
      foreignKey: "UserId",
      as: "user",
    });
    Task.belongsTo(models.Project, {
      foreignKey: "ProjectId",
      as: "project",
    });
  };

  return Task;
};
