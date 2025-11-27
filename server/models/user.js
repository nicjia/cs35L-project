const bcrypt = require("bcryptjs");

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8], //,
        }, // Implement and test later: is: Regex
      },
    },
    {
      //for security: hide password field from queries
      defaultScope: {
        attributes: { exclude: ["password"] },
      },
      scopes: {
        //password only when explicitly requested
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  // Hash password before saving
  User.beforeCreate(async (user, options) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  });

  User.associate = (models) => {
    User.hasMany(modles.Task, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  };

  return User;
};
