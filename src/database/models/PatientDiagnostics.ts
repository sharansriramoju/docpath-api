import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface PatientDiagnosticsAttributes {
  diagnostic_id: string;
  patient_id: string;
  media_url?: string;
  media_type?: string;
  description?: string;
  created_by_id: string;
  created_at?: Date;
}

interface PatientDiagnosticsCreationAttributes extends Optional<
  PatientDiagnosticsAttributes,
  "diagnostic_id" | "created_at" | "media_url" | "description" | "media_type"
> {}

class PatientDiagnostics
  extends Model<
    PatientDiagnosticsAttributes,
    PatientDiagnosticsCreationAttributes
  >
  implements PatientDiagnosticsAttributes
{
  public diagnostic_id!: string;
  public patient_id!: string;
  public media_url?: string;
  public media_type?: string;
  public description?: string;
  public created_by_id!: string;
  public created_at?: Date;
}

PatientDiagnostics.init(
  {
    diagnostic_id: {
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
    media_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    media_type: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
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
      allowNull: true,
      defaultValue: sequelize.literal(
        "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text)",
      ),
    },
  },
  {
    sequelize,
    modelName: "PatientDiagnostics",
    tableName: "patient_diagnostics",
    timestamps: false,
  },
);

export default PatientDiagnostics;
