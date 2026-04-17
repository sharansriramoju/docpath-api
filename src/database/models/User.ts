import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface UserAttributes {
  user_id: string;
  name: string;
  email?: string;
  phone: string;
  gender: string;
  date_of_birth: Date;
  role_id?: number;
  created_at?: Date;
  updated_at?: Date;
  hashed_email?: string;
  hashed_phone?: string;
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  "user_id" | "updated_at" | "created_at" | "email" | "role_id"
> {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public user_id!: string;
  public name!: string;
  public email?: string;
  public phone!: string;
  public gender!: string;
  public date_of_birth!: Date;
  public role_id?: number;
  public created_at?: Date;
  public updated_at?: Date;
}

User.init(
  {
    user_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: sequelize.literal("gen_random_uuid()"),
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      unique: true,
      allowNull: false,
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hashed_phone: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    hashed_email: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    role_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "roles",
        key: "role_id",
      },
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
    modelName: "User",
    tableName: "users",
    timestamps: false,
  },
);

export default User;
