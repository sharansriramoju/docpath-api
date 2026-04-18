import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

export enum MediaTypeEnum {
  IMAGE = "image",
  VIDEO = "video",
  AUDIO = "audio",
}

interface AppointmentMediaAttributes {
  media_id: string;
  appointment_id: string;
  media_type: MediaTypeEnum;
  media_url: string;
  description?: string;
  patient_id: string;
  created_by_id: string;
  created_at?: Date;
}

interface AppointmentMediaCreationAttributes extends Optional<
  AppointmentMediaAttributes,
  "media_id" | "created_at" | "description"
> {}

class AppointmentMedia
  extends Model<AppointmentMediaAttributes, AppointmentMediaCreationAttributes>
  implements AppointmentMediaAttributes
{
  public media_id!: string;
  public appointment_id!: string;
  public media_type!: MediaTypeEnum;
  public media_url!: string;
  public description?: string;
  public patient_id!: string;
  public created_by_id!: string;
  public created_at?: Date;
}

AppointmentMedia.init(
  {
    media_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
      allowNull: false,
    },
    appointment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "appointments",
        key: "appointment_id",
      },
    },
    media_type: {
      type: DataTypes.ENUM(...Object.values(MediaTypeEnum)),
      allowNull: false,
    },
    media_url: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
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
      allowNull: true,
      defaultValue: sequelize.literal(
        "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text)",
      ),
    },
  },
  {
    sequelize,
    modelName: "AppointmentMedia",
    tableName: "appointment_media",
    timestamps: false,
  },
);

export default AppointmentMedia;
