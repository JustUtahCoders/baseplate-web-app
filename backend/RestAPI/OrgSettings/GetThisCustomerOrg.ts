import {
  CustomerOrgAttributes,
  CustomerOrgModel,
} from "../../DB/Models/CustomerOrg/CustomerOrg";
import { router } from "../../Router";
import { invalidRequest, serverApiError } from "../../Utils/EndpointResponses";
import { AnyRouteParams } from "../../Utils/EndpointUtils";

router.get<AnyRouteParams, EndpointGetMyCustomerOrgResBody>(
  `/api/orgs/me`,

  // Implementation
  async (req, res) => {
    if (req.baseplateAccount.isUser) {
      return invalidRequest(
        res,
        `This endpoint can only be used with baseplate-token authentication (not cookie).`
      );
    }

    const customerOrg = await CustomerOrgModel.findByPk(
      req.baseplateAccount.serviceAccount!.customerOrgId!
    );

    if (!customerOrg) {
      return serverApiError(
        res,
        `customerOrgId appears to be valid, but failed to retrieve CustomerOrg from DB`
      );
    }

    res.json(customerOrg.get({ plain: true }));
  }
);

export type EndpointGetMyCustomerOrgResBody = CustomerOrgAttributes;
