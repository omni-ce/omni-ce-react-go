import type { Page } from "@playwright/test";
import { buttonClick, playNotification } from "../function";
import { module_selected, started_exist } from "../variable";

async function Role(page: Page) {
  if (
    started_exist.length === 0 &&
    module_selected.length > 0 &&
    !module_selected.includes("role")
  ) {
    console.log("Role skip ...");
    return;
  }
  started_exist.push(true);

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
