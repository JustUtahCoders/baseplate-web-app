import { CustomerOrgAttributes } from "./CustomerOrg/CustomerOrg";
import { getAllStaticWebSettings } from "../../RestAPI/OrgSettings/GetStaticWebSettings";
import { writeCloudflareKV } from "../../RestAPI/Deployments/CloudflareKV";

export async function updateCustomerOrgCloudflareSettings(
  customerOrg: CustomerOrgAttributes
) {
  const orgSettingsResult = await getAllStaticWebSettings(customerOrg.id);
  if (orgSettingsResult.success) {
    await writeCloudflareKV(
      `org-settings-${customerOrg.orgKey}`,
      orgSettingsResult.data
    );
  } else {
    throw Error(`Failed to set org settings after upserting CustomerOrg`);
  }
}
