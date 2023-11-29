import { generateTotalChangelog, generateChangelog } from "../log";
import type { ChangelogOption } from "../log";

export async function genChangelog(
  options?: Partial<ChangelogOption>,
  total = false
) {
  if (total) {
    await generateTotalChangelog(options);
  } else {
    await generateChangelog(options);
  }
}
