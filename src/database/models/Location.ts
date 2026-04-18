import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface LocationAttributes {
  location_id: string;
  name: string;
  latitude?: string;
  longitude?: string;
  google_maps_url: string;
  created_at?: Date;
  created_by_id: string;
}

interface LocationCreationAttributes extends Optional<
  LocationAttributes,
  "location_id" | "created_at"
> {}

class Location
  extends Model<LocationAttributes, LocationCreationAttributes>
  implements LocationAttributes
{
  public location_id!: string;
  public name!: string;
  public latitude?: string;
  public longitude?: string;
  public google_maps_url!: string;
  public created_at?: Date;
  public created_by_id!: string;
}

Location.init(
  {
    location_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    latitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    google_maps_url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_by_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
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
    modelName: "Location",
    tableName: "locations",
    timestamps: false,
  },
);

export default Location;
