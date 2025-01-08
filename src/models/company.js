import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const Company = sequelize.define(
  'Company',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    domain: {
      type: DataTypes.STRING,
      allowNull: false
    },
    realm: {
      type: DataTypes.STRING,
      allowNull: false
    },
    realmId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    api_key: {
      type: DataTypes.STRING,
      allowNull: false
    }
  },
  {
    tableName: 'companies',
    timestamps: true
  }
);

export default Company;
