const {DataTypes} = require("sequelize");

module.exports = (sequelize) => {
    const ReceptionPoint = sequelize.define(
      "ReceptionPoint",
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
        },
        location: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        contact_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        contact_phone: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        contact_email: {
          type: DataTypes.STRING,
          allowNull: false,
          validate: {
            isEmail: true,
          },
        },
        opening_time: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        closing_time: {
          type: DataTypes.STRING,
          allowNull: true,
        },
      },
      {
        tableName: "reception_point",
        timestamps: true,
      }
    );
  
    return ReceptionPoint;
  };
  