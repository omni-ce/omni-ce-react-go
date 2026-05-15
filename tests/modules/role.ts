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

  // click expand role admin
  await buttonClick(page, ".role-item-Admin");

  // click checklist menu user
  await buttonClick(page, ".role-check-admin-user");

  // click button save
  await buttonClick(page, ".role-button-save", 500);

  //# end delay
  await playNotification("section");
}

export default Role;
