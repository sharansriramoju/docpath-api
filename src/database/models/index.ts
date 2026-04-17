import User from "./User";

import sequelize from "../sequelize";
import Role from "./Role";
import Location from "./Location";
import Appointment from "./Appointment";
import AppointmentMedia from "./AppointmentMedia";

// User-Role Associations
Role.hasMany(User, { foreignKey: "role_id", as: "users" });
User.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Location-User Associations
Location.belongsTo(User, {
  foreignKey: "created_by_id",
  as: "created_by",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(Location, {
  foreignKey: "created_by_id",
  as: "created_locations",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Appointment Associations
Appointment.belongsTo(User, {
  foreignKey: "patient_id",
  as: "patient",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Appointment.belongsTo(User, {
  foreignKey: "doctor_id",
  as: "doctor",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Appointment.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Appointment.belongsTo(User, {
  foreignKey: "created_by_id",
  as: "created_by",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

User.hasMany(Appointment, {
  foreignKey: "patient_id",
  as: "patient_appointments",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(Appointment, {
  foreignKey: "doctor_id",
  as: "doctor_appointments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Location.hasMany(Appointment, {
  foreignKey: "location_id",
  as: "appointments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(Appointment, {
  foreignKey: "created_by_id",
  as: "created_appointments",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// AppointmentMedia Associations

AppointmentMedia.belongsTo(Appointment, {
  foreignKey: "appointment_id",
  as: "appointment",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
AppointmentMedia.belongsTo(User, {
  foreignKey: "patient_id",
  as: "patient",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
AppointmentMedia.belongsTo(User, {
  foreignKey: "created_by_id",
  as: "created_by",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
Appointment.hasMany(AppointmentMedia, {
  foreignKey: "appointment_id",
  as: "media",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(AppointmentMedia, {
  foreignKey: "patient_id",
  as: "patient_media",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(AppointmentMedia, {
  foreignKey: "created_by_id",
  as: "created_media",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

export { sequelize, User, Role, Location, Appointment, AppointmentMedia };
