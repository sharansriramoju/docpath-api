import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user: any) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Super admin
  for (const perm of user.permissions) {
    if (perm.RolePermission.scope === "LIMITED") {
      if (perm.subject === "DoctorRoutine") {
        can(perm.action, perm.subject, {
          doctor_id: {
            // Include the user's own doctor_id to allow access to their own routine
            $in: [
              ...user.reporting_doctors.map((doc: any) => doc.doctor_id),
              user.user_id,
            ],
          },
        });
      } else if (perm.subject === "Locations" && perm.action === "read") {
        can(perm.action, perm.subject, { status: "active" });
      } else if (perm.subject === "Appointments") {
        can(perm.action, perm.subject, {
          location_id: {
            $in: user.locations.map((loc: any) => loc.location_id),
          },
          doctor_id: {
            // Include the user's own doctor_id to allow access to their own appointments
            $in: [
              ...user.reporting_doctors.map((doc: any) => doc.doctor_id),
              user.user_id,
            ],
          },
        });
      }
    } else {
      can(perm.action, perm.subject, perm.RolePermission.conditions);
    }
  }

  return build();
}
