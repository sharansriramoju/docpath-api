import User from "./User";

import sequelize from "../sequelize";
import Role from "./Role";
import Location from "./Location";
import Appointment from "./Appointment";
import AppointmentMedia from "./AppointmentMedia";
import PatientDiagnostic from "./PatientDiagnostics";
import DoctorRoutine from "./DoctorRoutine";
import DoctorSchedule from "./DoctorSchedule";
import Otp from "./Otp";
import RolePermission from "./RolePermission";
import Permission from "./Permission";
import UserLocation from "./UserLocation";
import ReportingDoctor from "./ReportingDoctor";

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

// PatientDiagnostic Associations

PatientDiagnostic.belongsTo(User, {
  foreignKey: "patient_id",
  as: "patient",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
PatientDiagnostic.belongsTo(User, {
  foreignKey: "created_by_id",
  as: "created_by",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(PatientDiagnostic, {
  foreignKey: "patient_id",
  as: "diagnostics",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
User.hasMany(PatientDiagnostic, {
  foreignKey: "created_by_id",
  as: "created_diagnostics",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// DoctorRoutine Associations

DoctorRoutine.belongsTo(User, {
  foreignKey: "doctor_id",
  as: "doctor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
DoctorRoutine.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(DoctorRoutine, {
  foreignKey: "doctor_id",
  as: "routines",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Location.hasMany(DoctorRoutine, {
  foreignKey: "location_id",
  as: "routines",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

//DoctorSchedule Associations
DoctorSchedule.belongsTo(User, {
  foreignKey: "doctor_id",
  as: "doctor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
DoctorSchedule.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
DoctorSchedule.belongsTo(User, {
  foreignKey: "created_by_id",
  as: "created_by",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
User.hasMany(DoctorSchedule, {
  foreignKey: "doctor_id",
  as: "schedules",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Location.hasMany(DoctorSchedule, {
  foreignKey: "location_id",
  as: "schedules",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// RolePermission Associations
RolePermission.belongsTo(Role, {
  foreignKey: "role_id",
  as: "role",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
RolePermission.belongsTo(Permission, {
  foreignKey: "permission_id",
  as: "permission",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Role.hasMany(RolePermission, {
  foreignKey: "role_id",
  as: "role_permissions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
Permission.hasMany(RolePermission, {
  foreignKey: "permission_id",
  as: "permission_roles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Role - Permission Associations (through RolePermission)
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  as: "permissions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  as: "roles",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// User - Permission Associations (through RolePermission via User.role_id)
User.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: "role_id",
  otherKey: "permission_id",
  sourceKey: "role_id",
  as: "permissions",
  constraints: false,
});

Permission.belongsToMany(User, {
  through: RolePermission,
  foreignKey: "permission_id",
  otherKey: "role_id",
  targetKey: "role_id",
  as: "users",
  constraints: false,
});

// User Location Associations

User.belongsToMany(Location, {
  through: UserLocation,
  foreignKey: "user_id",
  otherKey: "location_id",
  as: "locations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Location.belongsToMany(User, {
  through: UserLocation,
  foreignKey: "location_id",
  otherKey: "user_id",
  as: "users",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

UserLocation.belongsTo(Location, {
  foreignKey: "location_id",
  as: "location",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

UserLocation.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(UserLocation, {
  foreignKey: "user_id",
  as: "user_locations",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

Location.hasMany(UserLocation, {
  foreignKey: "location_id",
  as: "location_users",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

ReportingDoctor.belongsTo(User, {
  foreignKey: "doctor_id",
  as: "doctor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});
ReportingDoctor.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(ReportingDoctor, {
  foreignKey: "doctor_id",
  as: "reporting_doctors_as_doctor",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.hasMany(ReportingDoctor, {
  foreignKey: "user_id",
  as: "reporting_doctors_as_user",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(User, {
  through: ReportingDoctor,
  as: "reporting_doctors",
  foreignKey: "user_id",
  otherKey: "doctor_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

User.belongsToMany(User, {
  through: ReportingDoctor,
  as: "reported_users",
  foreignKey: "doctor_id",
  otherKey: "user_id",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

export {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Location,
  Appointment,
  AppointmentMedia,
  DoctorRoutine,
  PatientDiagnostic,
  Otp,
  UserLocation,
  ReportingDoctor,
};
