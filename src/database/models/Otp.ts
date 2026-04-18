import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../sequelize";

interface OtpAttributes {
  id: number;
  otp: string;
  phone?: string;
  email?: string;
  createdAt?: Date;
}

interface OtpCreationAttributes extends Optional<
  OtpAttributes,
  "id" | "createdAt" | "phone" | "email"
> {}

class Otp
  extends Model<OtpAttributes, OtpCreationAttributes>
  implements OtpAttributes
{
  public id!: number;
  public otp!: string;
  public phone?: string;
  public email?: string;
  public createdAt?: Date;
}

Otp.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
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
