import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user: any) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Super admin
  for (const perm of user.permissions) {
    if (perm.RolePermission.scope === "LIMITED") {
      if (perm.subject === "DoctorRoutine") {
        can(perm.action, perm.subject, { reporting_doctor_id: user.user_id });
      }
    } else {
      can(perm.action, perm.subject, perm.RolePermission.conditions);
    }
  }

  return build();
}
