import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface RoleAttributes {
  role_id: number;
  name: string;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface RoleCreationAttributes extends Optional<
  RoleAttributes,
  "role_id" | "updated_at" | "created_at"
> {}

class Role
  extends Model<RoleAttributes, RoleCreationAttributes>
  implements RoleAttributes
{
  public role_id!: number;
  public name!: string;
  public description?: string;
  public created_at?: Date;
  public updated_at?: Date;
}

Role.init(
  {
    role_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal(
        "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text)",
      ),
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: sequelize.literal(
        "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text)",
      ),
    },
  },
  {
    sequelize,
    modelName: "Role",
    tableName: "roles",
    timestamps: false,
  },
);

export default Role;
