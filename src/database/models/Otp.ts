import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface OtpAttributes {
  id: number;
  otp: Buffer;
  phone?: Buffer;
  email?: Buffer;
  created_at?: Date;
}

interface OtpCreationAttributes extends Optional<
  OtpAttributes,
  "id" | "created_at" | "phone" | "email"
> {}

class Otp
  extends Model<OtpAttributes, OtpCreationAttributes>
  implements OtpAttributes
{
  public id!: number;
  public otp!: Buffer;
  public phone?: Buffer;
  public email?: Buffer;
  public created_at?: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.BLOB,
      allowNull: false,
    },
    phone: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    email: {
      type: DataTypes.BLOB,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal(
        "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'::text)",
      ),
    },
  },
  {
    sequelize,
    modelName: "Otp",
    tableName: "otps",
    timestamps: false,
  },
);

export default Otp;
