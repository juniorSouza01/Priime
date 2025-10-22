module.exports = (sequelize, DataTypes) => {
  const AccessLog = sequelize.define('AccessLog', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    },
    ipAddress: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'access_logs',
    timestamps: false
  });

  AccessLog.associate = (models) => {
    AccessLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  };

  return AccessLog;
};