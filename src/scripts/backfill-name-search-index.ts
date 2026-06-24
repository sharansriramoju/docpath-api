/**
 * One-off backfill: populate User.name_search_index for existing rows so the
 * prefix blind-index name search works for users created before the column
 * existed.
 *
 * Prerequisite: the server must have started at least once so sync() has added
 * the name_search_index column.
 *
 * Run: npx ts-node --transpile-only src/scripts/backfill-name-search-index.ts
 */
import { sequelize, User } from "../database/models";
import { buildNameSearchIndex, decryptPII } from "../helpers/index.helper";

(async () => {
  try {
    const users = await User.findAll({ attributes: ["user_id", "name"] });
    let updated = 0;
    let skipped = 0;

    for (const user of users) {
      const encrypted_name = user.getDataValue("name");
      if (!encrypted_name) {
        skipped++;
        continue;
      }
      try {
        const name = decryptPII(encrypted_name);
        await User.update(
          { name_search_index: buildNameSearchIndex(name) },
          { where: { user_id: user.getDataValue("user_id") } },
        );
        updated++;
      } catch (err) {
        // Don't let one bad/legacy row abort the whole backfill.
        console.error(
          "Skipping user (decrypt/update failed):",
          user.getDataValue("user_id"),
          err,
        );
        skipped++;
      }
    }

    console.log(`✅ Backfill complete. Updated: ${updated}, skipped: ${skipped}`);
    await sequelize.close();
    process.exit(0);
  } catch (err) {
    console.error("Backfill failed:", err);
    process.exit(1);
  }
})();
