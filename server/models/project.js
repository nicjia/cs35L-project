// server/models/project.js

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define("Project", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#3b82f6", // Default blue
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  });

  Project.associate = (models) => {
    Project.belongsTo(models.User, {
      foreignKey: "UserId",
      as: "user",
      onDelete: "CASCADE",
    });
    Project.hasMany(models.Task, {
      foreignKey: "ProjectId",
      as: "tasks",
    });
  };

  return Project;
};
