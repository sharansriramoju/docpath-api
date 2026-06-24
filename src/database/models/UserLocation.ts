import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface UserLocationAttributes {
  user_location_id: number;
  user_id: string;
  location_id: string;
  created_at?: Date;
}

interface UserLocationCreationAttributes extends Optional<
  UserLocationAttributes,
  "user_location_id" | "created_at"
> {}

class UserLocation
  extends Model<UserLocationAttributes, UserLocationCreationAttributes>
  implements UserLocationAttributes
{
  public user_location_id!: number;
  public user_id!: string;
  public location_id!: string;
  public created_at?: Date;
}

UserLocation.init(
  {
    user_location_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "locations",
        key: "location_id",
      },
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
    modelName: "UserLocation",
    tableName: "user_locations",
    timestamps: false,
  },
);

export default UserLocation;
