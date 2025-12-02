

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
          len: [8, 100], //,
        }, // Implement and test later: is: Regex
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      resetTokenExpiry: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      //for security: hide password field from queries
      defaultScope: {
        attributes: { exclude: ["password", "resetToken", "resetTokenExpiry"] },
      },
      scopes: {
        //password only when explicitly requested
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  // Hash password before saving (for new users and password updates)
  User.beforeSave(async (user) => {
    // Only hash if password was changed
    if (user.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  });

  User.associate = (models) => {
    User.hasMany(models.Task, {
      foreignKey: "UserId",
      onDelete: "CASCADE",
    });
  };

  return User;
};
