import { AbilityBuilder, createMongoAbility } from "@casl/ability";

export function defineAbilityFor(user: any) {
  const { can, build } = new AbilityBuilder(createMongoAbility);

  // Super admin
  if (user.role.name === "Doctor") {
    can("manage", "all");
    return build();
  }

  return build();
}
