import type { Page } from "@playwright/test";
import { buttonClick, playNotification } from "../function";
import { checkModuleStart } from "../variable";

async function Role(page: Page) {
  if (checkModuleStart("Role", "role")) {
    return;
  }

  //# Role Check
  // click menu role
  await buttonClick(page, ".sidebar-menu-role");

  await changeRole(page, "Admin", ["admin-user"]);

  // click button save
  await buttonClick(page, ".role-button-save", 500);

  //# end delay
  await playNotification("section");
}

export default Role;

const changeRole = async (
  page: Page,
  select_role: string,
  checklists: string[],
) => {
  // click expand role admin
  await buttonClick(page, `.role-item-${select_role}`);
  for (const checklist of checklists) {
    // click checklist menu
    await buttonClick(page, `.role-check-${checklist}`);
  }
};
