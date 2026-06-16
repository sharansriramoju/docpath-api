import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface ReportingDoctorAttributes {
  reporting_doctor_id: string;
  doctor_id: string;
  user_id: string;
  created_at?: Date;
}

interface ReportingDoctorCreationAttributes extends Optional<
  ReportingDoctorAttributes,
  "reporting_doctor_id" | "created_at"
> {}

class ReportingDoctor
  extends Model<ReportingDoctorAttributes, ReportingDoctorCreationAttributes>
  implements ReportingDoctorAttributes
{
  public reporting_doctor_id!: string;
  public doctor_id!: string;
  public user_id!: string;
  public created_at?: Date;
}

ReportingDoctor.init(
  {
    reporting_doctor_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: sequelize.literal("gen_random_uuid()"),
    },
    doctor_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
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
    modelName: "ReportingDoctor",
    tableName: "reporting_doctors",
    timestamps: false,
  },
);

export default ReportingDoctor;
