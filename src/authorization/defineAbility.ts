import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user: any) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Super admin
  for (const perm of user.permissions) {
    can(perm.action, perm.subject, perm.RolePermission.conditions);
  }

  return build();
}
