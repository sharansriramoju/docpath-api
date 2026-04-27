import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface PermissionAttributes {
  permission_id: string;
  action: string;
  subject: string;
  created_at?: Date;
}

interface PermissionCreationAttributes extends Optional<
  PermissionAttributes,
  "permission_id" | "created_at"
> {}

class Permission
  extends Model<PermissionAttributes, PermissionCreationAttributes>
  implements PermissionAttributes
{
  public permission_id!: string;
  public action!: string;
  public subject!: string;
  public created_at!: Date;

  // timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Permission.init(
  {
    permission_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    action: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Permission",
    tableName: "permissions",
    timestamps: false, // We're using custom created_at field
  },
);

export default Permission;
