import { AbilityBuilder, createMongoAbility, MongoAbility } from "@casl/ability";
import fs from "fs";
import path from "path";
import { User } from "./types";

export type AttributePermission = {
  id: string;
  permissions: string[];
};

export type ResourceAttributes = Record<string, AttributePermission[]>;

function loadRolePermissions(filePath: string): Record<string, string[]> {
  try {
    const permissionsPath = path.resolve(__dirname, "..", "..", filePath);
    const data = JSON.parse(fs.readFileSync(permissionsPath, "utf-8"));
    return data.roles || {};
  } catch (error) {
    console.error("Error loading role permissions:", error);
    return {};
  }
}
export function defineRulesFor(user: User | null, filePath: string, resource?: ResourceAttributes): MongoAbility {
  const { can, rules } = new AbilityBuilder<MongoAbility>(createMongoAbility);

  if (!user) return createMongoAbility(rules);

  const userRoles = Array.isArray(user.roles) ? user.roles : [user.role].filter(Boolean);
  const rolePermissions = loadRolePermissions(filePath);

  for (const role of userRoles) {
    const permissions = rolePermissions[role] || [];

    for (const permission of permissions) {
      const [subject, actionsStr] = permission.split(":");
      if (!subject || !actionsStr) continue;

      const actions = actionsStr.split("|");
      const attributeAccess = resource?.[subject];

      if (Array.isArray(attributeAccess)) {
        for (const attr of attributeAccess) {
          for (const action of attr.permissions) {
            // can(permission, resource, policy);
            can(action, subject, { [subject]: attr.id });
          }
        }
      } else {
        for (const action of actions) {
          can(action, subject);
        }
      }
    }
  }

  return createMongoAbility(rules);
}

/*

Type:
  resource: {[
    attributes:[
      attributeName: [
        { id: string, permissions: string[] },
      ],
      attributeName: [
        { id: string, permissions: string[] },
      ]
    ]
  ]}

Example:

  resource: [{
    room:[
      {id: "Room-1", permissions: ["read", "write"]},
      {id: "Room-2", permissions: ["read"]},
    ]},
    {user:[
    {id: "User-1", permissions: ["read", "write"]},
    {id: "User-2", permissions: ["read"]},
  ]}
  ]

Policy:
  

*/
