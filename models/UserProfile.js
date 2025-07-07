module.exports = (sequelize, DataTypes) => {
  const UserProfile = sequelize.define('userprofile', {
    user_id: DataTypes.INTEGER,
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    mobile: DataTypes.STRING,
    address: DataTypes.STRING,
    pincode: DataTypes.STRING,
    landmark: DataTypes.STRING,
  
    // optional: createdAt/updatedAt manually mapped
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  }, {
    tableName: 'userprofile',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });

  return UserProfile;
};
