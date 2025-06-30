// services/dashboard.service.ts
import { Service, ServiceBroker, Context } from "moleculer";
import { AbacMixin } from "../mixins/abac/abac.mixin";
import { users } from "../db/users";
import * as Constants from "../constants";

export class DashboardService extends Service {
    constructor(broker: ServiceBroker) {
        super(broker);

        this.parseServiceSchema({
            name: "dashboard",
            mixins: [AbacMixin],
            hooks: {
                before: {
                    "*": [(ctx: Context) => {
                        // @ts-ignore
                        const userId = ctx.params.userId;
                        const user = users.get(userId);
                        console.log("User in Dashboard Service:", user);
                        if (!user) {
                            throw new Error("User not found");
                        }
                        // @ts-ignore
                        ctx.meta.user = user;
                        // @ts-ignore
                        ctx.meta.rolePermissionFilePath = Constants.ROLE_PERMISSIONS_FILE_PATH
                    }, "checkPermissions"]
                }
            },
            actions: {
                "dashboard-read": {
                    meta: {
                        abac: {
                            action: "read",
                            resource: {
                                dashboard: "dashboard-1"
                            }
                        }
                    }
                    ,
                    params: { userId: "string" },
                    async handler(ctx: Context) {
                        console.log("ctxx ----", ctx.params)
                        return {
                            success: true,
                            message: "Dashboard data retrieved successfully!",
                        }
                    }
                },

                "dashboard-write": {
                    meta: {
                        abac: { action: "write", resource: "dashboard" }
                    },
                    params: { userId: "string" },
                    async handler(ctx: Context<{ userId: string }>) {
                        return { success: true, message: "Dashboard updated!" };
                    }
                }
            }
        });
    }
}
