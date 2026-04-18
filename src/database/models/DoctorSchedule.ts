import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface DoctorScheduleAttributes {
  schedule_id: string;
  doctor_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  location_id?: string;
  created_by_id: string;
  created_at?: Date;
}

interface DoctorScheduleCreationAttributes extends Optional<
  DoctorScheduleAttributes,
  "schedule_id" | "created_at" | "location_id"
> {}

class DoctorSchedule
  extends Model<DoctorScheduleAttributes, DoctorScheduleCreationAttributes>
  implements DoctorScheduleAttributes
{
  public schedule_id!: string;
  public doctor_id!: string;
  public date!: Date;
  public start_time!: string;
  public end_time!: string;
  public location_id?: string;
  public created_by_id!: string;
  public created_at?: Date;
}

DoctorSchedule.init(
  {
    schedule_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal("gen_random_uuid()"),
      primaryKey: true,
      allowNull: false,
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "locations",
        key: "location_id",
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
    modelName: "DoctorSchedule",
    tableName: "doctor_schedules",
    timestamps: false,
  },
);

export default DoctorSchedule;
