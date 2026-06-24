import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface UserAttributes {
  user_id: string;
  name: string;
  email?: string;
  phone: string;
  gender: string;
  date_of_birth: string;
  role_id?: number;
  profile_image_url?: string;
  created_at?: Date;
  updated_at?: Date;
  hashed_email?: Buffer;
  hashed_phone: Buffer;
  name_search_index?: string[];
}

interface UserCreationAttributes extends Optional<
  UserAttributes,
  | "user_id"
  | "updated_at"
  | "created_at"
  | "email"
  | "role_id"
  | "profile_image_url"
  | "hashed_email"
  | "name_search_index"
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
  public date_of_birth!: string;
  public role_id?: number;
  public profile_image_url?: string;
  public hashed_email?: Buffer;
  public hashed_phone!: Buffer;
  public name_search_index?: string[];
  public reporting_doctor_id?: string;
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
      allowNull: true,
    },
    phone: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    hashed_phone: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    hashed_email: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    // Prefix blind-index of the (encrypted) name for partial search.
    name_search_index: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: true,
    },
    gender: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    date_of_birth: {
      type: DataTypes.TEXT,
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
    profile_image_url: {
      type: DataTypes.TEXT,
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
    modelName: "User",
    tableName: "users",
    timestamps: false,
    indexes: [
      // GIN index accelerates the `name_search_index @> [...]` trigram search.
      {
        name: "users_name_search_index_gin",
        fields: ["name_search_index"],
        using: "GIN",
      },
    ],
  },
);

export default User;
