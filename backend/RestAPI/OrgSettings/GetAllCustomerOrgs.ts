import {
  CustomerOrg,
  CustomerOrgModel,
} from "../../DB/Models/CustomerOrg/CustomerOrg";
import { router } from "../../Router";
import { invalidRequest, serverApiError } from "../../Utils/EndpointResponses";
import { AnyRouteParams } from "../../Utils/EndpointUtils";

router.get<AnyRouteParams, EndpointGetAllCustomerOrgsResBody>(
  `/api/orgs/all`,

  // Implementation
  async (req, res) => {
    if (req.baseplateAccount.isServiceAccount) {
      return invalidRequest(
        res,
        `This endpoint can only be used with user authentication, not service account authentication, since service accounts only have access to exactly one organization`
      );
    }

    const user = req.baseplateAccount.user;

    if (!user) {
      return serverApiError(res, `Error retrieving user`);
    }

    const customerOrgs = await user.getCustomerOrgs();

    res.json({
      customerOrgs: customerOrgs.map((c) => {
        const obj = c.get({ plain: true });

        // Don't send undocumented join table info
        // @ts-ignore
        delete obj.UserCustomerOrgs;

        return obj;
      }),
    });
  }
);

export interface EndpointGetAllCustomerOrgsResBody {
  customerOrgs: CustomerOrg[];
}
