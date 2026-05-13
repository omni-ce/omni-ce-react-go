import type { Page } from "@playwright/test";

import CompanyEntity from "./company_entity";
import CompanyBranch from "./company_branch";

async function Company(page: Page) {
  await CompanyEntity(page);
  await CompanyBranch(page);
}

export default Company;
