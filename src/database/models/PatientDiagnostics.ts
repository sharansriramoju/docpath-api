import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface PatientDiagnosticAttributes {
  diagnostic_id: string;
  patient_id: string;
  media_url?: string;
  media_type?: string;
  description?: string;
  created_by_id: string;
  created_at?: Date;
}

interface PatientDiagnosticCreationAttributes extends Optional<
  PatientDiagnosticAttributes,
  "diagnostic_id" | "created_at" | "media_url" | "description" | "media_type"
> {}

class PatientDiagnostic
  extends Model<
    PatientDiagnosticAttributes,
    PatientDiagnosticCreationAttributes
  >
  implements PatientDiagnosticAttributes
{
  public diagnostic_id!: string;
  public patient_id!: string;
  public media_url?: string;
  public media_type?: string;
  public description?: string;
  public created_by_id!: string;
  public created_at?: Date;
}

PatientDiagnostic.init(
  {
    diagnostic_id: {
      type: DataTypes.UUID,
      defaultValue: sequelize.literal("gen_random_uuid()"),
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
    modelName: "PatientDiagnostic",
    tableName: "patient_diagnostics",
    timestamps: false,
  },
);

export default PatientDiagnostic;
