import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface DoctorRoutineAttributes {
  routine_id: string;
  doctor_id: string;
  index?: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  location_id: string;
  created_by_id: string;
  created_at?: Date;
}

interface DoctorRoutineCreationAttributes extends Optional<
  DoctorRoutineAttributes,
  "routine_id" | "created_at" | "location_id"
> {}

class DoctorRoutine
  extends Model<DoctorRoutineAttributes, DoctorRoutineCreationAttributes>
  implements DoctorRoutineAttributes
{
  public routine_id!: string;
  public doctor_id!: string;
  public index?: number;
  public day_of_week!: number;
  public start_time!: string;
  public end_time!: string;
  public location_id!: string;
  public created_by_id!: string;
  public created_at?: Date;
}

DoctorRoutine.init(
  {
    routine_id: {
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
    index: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    day_of_week: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    location_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    modelName: "DoctorRoutine",
    tableName: "doctor_routine",
    timestamps: false,
  },
);

export default DoctorRoutine;
