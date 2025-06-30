import { Context, Errors } from "moleculer";
import { defineRulesFor, ResourceAttributes } from "./defineRules";

export const AbacMixin = {
  methods: {
    checkPermissions(ctx: Context) {
      // @ts-ignore
      const user = ctx.meta.user;
      // @ts-ignore
      const rolePermissionFilePath = ctx.meta.rolePermissionFilePath;
      if (!user) {
        throw new Errors.MoleculerClientError("Unauthorized", 401, "UNAUTHORIZED");
      }
      const resourceObj: ResourceAttributes = {
        dashboard: [
          { id: "dashboard-1", permissions: [ "read","write"] }
        ],
        room: [
          { id: "room-1", permissions: ["read"] }
        ]
      };
      const ability = defineRulesFor(user,rolePermissionFilePath,resourceObj);
      console.log("Ability:", ability);
      // @ts-ignore
      ctx.meta.ability = ability;

      const abacMeta = ctx.action?.meta?.abac;
      if (!abacMeta || !abacMeta.action || !abacMeta.resource) {
        throw new Errors.MoleculerClientError(
          `Missing ABAC meta for action ${ctx.action?.name}`,
          500,
          "ABAC_META_MISSING"
        );
      }

      const { action, resource } = abacMeta;
      const [subject] = Object.keys(resource);
      const subjectCondition = resource[subject];
      console.log("Action:", action);
      console.log("Resource:", resource);
      if (!ability.can(action, subject, subjectCondition)) {
        throw new Errors.MoleculerClientError("Forbidden", 403, "FORBIDDEN");
      }
    }
  },
};
