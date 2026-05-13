import type { Page } from "@playwright/test";
import { module_selected, started_exist } from "../../variable";

import CompanyEntity from "./company_entity";
import CompanyBranch from "./company_branch";

async function Company(page: Page) {
  if (
    started_exist.length === 0 &&
    module_selected.length > 0 &&
    !module_selected.includes("company")
  ) {
    console.log("Company skip ...");
    return;
  }

  await CompanyEntity(page);
  await CompanyBranch(page);
}

export default Company;
