//create anaoymous function that will create a task model and exportin it from this file so we have access to it in other files as well

module.exports = (sequelize, DataTypes) => {
  const Task = sequelize.define('Task', {
    //add columns for now
    //and add objects for each column
    title: {
      type: DataTypes.STRING,
      //do not allow a task without a title
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed'),
      defaultValue: 'pending',
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  });

  return Task;
};
