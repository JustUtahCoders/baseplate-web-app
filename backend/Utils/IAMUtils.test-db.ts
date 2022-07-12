import { AccountPermissionModel } from "../DB/Models/IAM/AccountPermission";
import {
  BaseplatePermission,
  PermissionModel,
} from "../DB/Models/IAM/Permission";
import {
  BaseplateUUID,
  ModelWithIncludes,
} from "../DB/Models/SequelizeTSHelpers";
import { dbHelpers } from "../DB/TestHelpers/DBTestHelpers";
import {
  findMissingPermissions,
  PermissionOperator,
  RequiredPermissions,
} from "./IAMUtils";

describe(`IAMUtils`, () => {
  let accountId, auditAccountId, customerOrgId;

  dbHelpers();

  beforeEach(() => {
    accountId = "1";
    auditAccountId = accountId;
    customerOrgId = "2";
  });

  describe(`findMissingPermissions`, () => {
    describe(`single SimpleRequiredPermission`, () => {
      describe("entity-less", () => {
        it(`fails with empty accountPermissions`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([
            `Missing permission ${BaseplatePermission.CreateMicrofrontend}`,
          ]);
        });

        it(`fails with mismatched accountPermissions`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(
              BaseplatePermission.DeployAllMicrofrontends
            ),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([
            `Missing permission ${BaseplatePermission.CreateMicrofrontend}`,
          ]);
        });

        it(`succeeds with correct accountPermissions`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(BaseplatePermission.CreateMicrofrontend),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([]);
        });

        it(`fails with mismatched customerOrgIds`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(BaseplatePermission.CreateMicrofrontend),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              "87678686",
              requiredPermissions
            )
          ).toEqual([
            `Missing permission ${BaseplatePermission.CreateMicrofrontend}`,
          ]);
        });
      });

      describe("requiring entity", () => {
        it(`succeeds with correct entity id`, () => {
          const entityId = "8";
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(
              BaseplatePermission.CreateMicrofrontend,
              entityId
            ),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
            entityId,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([]);
        });

        it(`fails with wrong entity id`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(
              BaseplatePermission.CreateMicrofrontend,
              "8"
            ),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
            entityId: "9",
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([
            `Missing permission ${BaseplatePermission.CreateMicrofrontend}`,
          ]);
        });
      });

      describe(`dateRevoked`, () => {
        it(`fails if dateRevoked has past`, () => {
          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(
              BaseplatePermission.CreateMicrofrontend,
              undefined,
              undefined,
              new Date("2022-01-01 00:00:00")
            ),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([
            `Missing permission ${BaseplatePermission.CreateMicrofrontend}`,
          ]);
        });

        it(`succeeds if dateRevoked is in the future`, () => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);

          const accountPermissions: ModelWithIncludes<
            AccountPermissionModel,
            { permission: PermissionModel }
          >[] = [
            createAccountPermission(
              BaseplatePermission.CreateMicrofrontend,
              undefined,
              undefined,
              tomorrow
            ),
          ];
          const requiredPermissions: RequiredPermissions = {
            permission: BaseplatePermission.CreateMicrofrontend,
          };

          expect(
            findMissingPermissions(
              accountPermissions,
              customerOrgId,
              requiredPermissions
            )
          ).toEqual([]);
        });
      });
    });

    describe(`OR'ed flat list of permissions`, () => {
      it(`succeeds with only one account permission in list`, () => {
        const accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(BaseplatePermission.DeployAllMicrofrontends),
        ];
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.or,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.DeployOneMicrofrontend,
              entityId: "10",
            },
          ],
        };

        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([]);
      });

      it(`succeeds with only one entity permission in list`, () => {
        const accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(
            BaseplatePermission.DeployOneMicrofrontend,
            "10"
          ),
        ];
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.or,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.DeployOneMicrofrontend,
              entityId: "10",
            },
          ],
        };

        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([]);
      });

      it(`fails with no entities in the list`, () => {
        const accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(BaseplatePermission.CreateMicrofrontend),
        ];
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.or,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.DeployOneMicrofrontend,
              entityId: "10",
            },
          ],
        };

        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([
          `Missing one of the following permissions: ${BaseplatePermission.DeployAllMicrofrontends}, ${BaseplatePermission.DeployOneMicrofrontend}`,
        ]);
      });
    });

    describe(`AND'ed flat list of permissions`, () => {
      it(`succeeds with all account permissions in list`, () => {
        const accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(BaseplatePermission.DeployAllMicrofrontends),
          createAccountPermission(
            BaseplatePermission.ManageAllMicrofrontendSettings
          ),
        ];
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.and,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.ManageAllMicrofrontendSettings,
            },
          ],
        };

        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([]);
      });

      it(`fails with only some permissions in the list`, () => {
        const accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(BaseplatePermission.DeployAllMicrofrontends),
        ];
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.and,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.ManageAllMicrofrontendSettings,
            },
          ],
        };

        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([
          `Missing permission ${BaseplatePermission.ManageAllMicrofrontendSettings}`,
        ]);
      });
    });

    describe("nested complex permissions", () => {
      it(`succeeds with AND top-level with OR nested`, () => {
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.and,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.ManageAllMicrofrontendSettings,
            },
            {
              operator: PermissionOperator.or,
              permissionList: [
                {
                  permission: BaseplatePermission.ManageAllEnvironments,
                },
                {
                  permission: BaseplatePermission.ManageAllMicrofrontendAccess,
                },
              ],
            },
          ],
        };

        let accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(BaseplatePermission.DeployAllMicrofrontends),
          createAccountPermission(
            BaseplatePermission.ManageAllMicrofrontendSettings
          ),
          createAccountPermission(BaseplatePermission.ManageAllEnvironments),
        ];
        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([]);
      });

      it(`fails with AND top-level with OR nested`, () => {
        const requiredPermissions: RequiredPermissions = {
          operator: PermissionOperator.and,
          permissionList: [
            {
              permission: BaseplatePermission.DeployAllMicrofrontends,
            },
            {
              permission: BaseplatePermission.ManageAllMicrofrontendSettings,
            },
            {
              operator: PermissionOperator.or,
              permissionList: [
                {
                  permission: BaseplatePermission.ManageAllEnvironments,
                },
                {
                  permission: BaseplatePermission.ManageAllMicrofrontendAccess,
                },
              ],
            },
          ],
        };

        let accountPermissions: ModelWithIncludes<
          AccountPermissionModel,
          { permission: PermissionModel }
        >[] = [
          createAccountPermission(
            BaseplatePermission.ManageAllMicrofrontendSettings
          ),
        ];
        expect(
          findMissingPermissions(
            accountPermissions,
            customerOrgId,
            requiredPermissions
          )
        ).toEqual([
          `Missing permission ${BaseplatePermission.DeployAllMicrofrontends}`,
          `Missing one of the following permissions: ${BaseplatePermission.ManageAllEnvironments}, ${BaseplatePermission.ManageAllMicrofrontendAccess}`,
        ]);
      });
    });
  });

  function createAccountPermission(
    perm: BaseplatePermission,
    entityId: BaseplateUUID = null,
    requiresEntityId: boolean = Boolean(entityId),
    dateRevoked: Date | undefined = undefined
  ): ModelWithIncludes<
    AccountPermissionModel,
    { permission: PermissionModel }
  > {
    const accountPermission = AccountPermissionModel.build({
      accountId,
      auditAccountId,
      customerOrgId,
      permissionId: perm,
      entityId,
      dateRevoked,
    }) as ModelWithIncludes<
      AccountPermissionModel,
      { permission: PermissionModel }
    >;

    accountPermission.permission = PermissionModel.build({
      name: perm,
      description: perm,
      humanReadableName: perm,
      requiresEntityId,
    });

    return accountPermission;
  }
});
