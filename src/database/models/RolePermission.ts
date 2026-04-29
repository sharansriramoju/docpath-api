import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

// Define the scope enum type

interface RolePermissionAttributes {
  id: number;
  role_id: number;
  permission_id: string;
  scope?: "ALL" | "LIMITED";
  conditions?: object;
}

interface RolePermissionCreationAttributes extends Optional<
  RolePermissionAttributes,
  "id" | "scope" | "conditions"
> {}

class RolePermission
  extends Model<RolePermissionAttributes, RolePermissionCreationAttributes>
  implements RolePermissionAttributes
{
  public id!: number;
  public role_id!: number;
  public permission_id!: string;
  public scope?: "ALL" | "LIMITED";
  public conditions?: object;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RolePermission.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "roles",
        key: "role_id",
      },
    },
    permission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "permissions",
        key: "permission_id",
      },
    },
    scope: {
      type: DataTypes.ENUM,
      values: ["ALL", "LIMITED"],
      allowNull: true,
    },
    conditions: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "RolePermission",
    tableName: "role_permissions",
    timestamps: false,
  },
);

export default RolePermission;
