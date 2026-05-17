import type { Page } from "@playwright/test";
import {
  buttonClick,
  inputFile,
  inputFill,
  playNotification,
  scrollDown,
  selectAddress,
} from "../function";
import { checkModuleStart } from "../variable";

async function User(page: Page) {
  if (checkModuleStart("User", "user")) {
    return;
  }

  //# Add New User
  // click menu user
  await buttonClick(page, ".sidebar-menu-user");

  await insertNewUser(
    page,
    "sandhika-galih.jpeg",
    "Sandhika Galih",
    "sandhikagalih",
    "SandhikaGalih@123",
    "sandhikagalih@test.com",
    "8123456789",
    ["jawa", "kota ban", "anta", "tengah"],
    [
      {
        division: "management",
        role: "admin",
      },
      {
        division: "management",
        role: "operator",
      },
    ],
  );

  //# end delay
  await playNotification("section");
}

export default User;

const insertNewUser = async (
  page: Page,
  file_avatar: string,
  name: string,
  username: string,
  password: string,
  email: string,
  phone: string,
  address: string[],
  roles: {
    division: string;
    role: string;
  }[],
) => {
  // click button add
  await buttonClick(page, ".user-pagination-button-add");

  // upload foto user, class: field-file-avatar
  await inputFile(page, ".field-file-avatar", file_avatar);

  // input nama lengkap user, class: field-text-name
  await inputFill(page, ".field-text-name", name);

  // input username, class: field-text-username
  await inputFill(page, ".field-text-username", username);

  // input password, class: field-text-password
  await inputFill(page, ".field-text-password", password, 3000);

  // input email, class: field-email-email
  await inputFill(page, ".field-email-email", email);

  // input phone, class: field-phone-phone
  await inputFill(page, ".field-phone-phone", phone);

  await scrollDown(page, ".user-pagination-dialog");

  await selectAddress(page, address[0], address[1], address[2], address[3]);

  for (let index = 0; index < roles.length; index++) {
    const { division, role } = roles[index];

    // Divisi Role Pertama
    await buttonClick(page, ".roles-array-button-add", 1500);
    await scrollDown(page, ".user-pagination-dialog", 300);

    // Pilih Role Divisi Pertama: Management
    await buttonClick(
      page,
      `.item-field-roles-${index}-division_id #field-division_id`,
      1000,
    );
    await inputFill(
      page,
      ".field-division_id-searchable-select-input",
      division,
    );
    await buttonClick(page, "#searchable-select-portal button", 1500);

    // Pilih Role Jabatan Pertama: Admin
    await buttonClick(
      page,
      `.item-field-roles-${index}-role_id #field-role_id`,
      1000,
    );
    await inputFill(page, ".field-role_id-searchable-select-input", role);
    await buttonClick(page, "#searchable-select-portal button", 1500);
  }

  // Click Save ...
  await buttonClick(page, ".user-pagination-button-save", 1000);
};
