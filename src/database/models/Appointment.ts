import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface AppointmentAttributes {
  appointment_id: string;
  patient_id: string;
  doctor_id: string;
  location_id: string;
  date: Date;
  start_time: string;
  end_time: string;
  doctor_notes?: string;
  prescription?: string;
  created_at?: Date;
  created_by_id: string;
}

interface AppointmentCreationAttributes extends Optional<
  AppointmentAttributes,
  "appointment_id" | "created_at" | "doctor_notes" | "prescription"
> {}

class Appointment
  extends Model<AppointmentAttributes, AppointmentCreationAttributes>
  implements AppointmentAttributes
{
  public appointment_id!: string;
  public patient_id!: string;
  public doctor_id!: string;
  public location_id!: string;
  public date!: Date;
  public start_time!: string;
  public end_time!: string;
  public doctor_notes?: string;
  public prescription?: string;
  public created_at?: Date;
  public created_by_id!: string;
}

Appointment.init(
  {
    appointment_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal("uuid_generate_v4()"),
      primaryKey: true,
      allowNull: false,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "user_id",
      },
    },
    doctor_id: {
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
    date: {
      type: DataTypes.DATEONLY,
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
    doctor_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    prescription: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: "Appointment",
    tableName: "appointments",
    timestamps: false,
  },
);

export default Appointment;
