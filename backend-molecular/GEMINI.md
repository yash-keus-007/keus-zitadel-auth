# ABAC Mixin Documentation

## Overview

The ABAC (Attribute-Based Access Control) Mixin is a powerful authorization system built for Moleculer.js services that implements fine-grained permissions using the CASL (Code Access Security Layer) library. This mixin provides attribute-based access control that goes beyond traditional role-based permissions by allowing control based on resource attributes and contextual conditions.

## Architecture

The ABAC system consists of three main components:

### 1. AbacMixin (`mixins/abac/abac.mixin.ts`)
The core mixin that provides the `checkPermissions` method to validate user access to resources.

### 2. defineRulesFor (`mixins/abac/defineRules.ts`)
A utility function that creates CASL abilities based on user roles and resource attributes.

### 3. Type Definitions (`mixins/abac/types.ts`)
TypeScript interfaces for User and CASL mixin options.

## Key Features

- **Role-based permissions**: Load permissions from configuration files
- **Attribute-based control**: Grant access based on specific resource attributes
- **Resource-specific permissions**: Different permissions for different resource instances
- **Flexible permission definition**: Support for multiple actions per resource type
- **Integration with Moleculer.js**: Seamless integration with service actions and hooks

## How It Works

### Permission Definition Structure

Permissions are defined in `assets/role-permissions.json`:

```json
{
  "roles": {
    "admin": [
      "dashboard:read|write|update|delete",
      "room:read|create|update|delete"
    ],
    "user": [
      "profile:view",
      "document:read"
    ]
  }
}
```

Format: `"resource:action1|action2|action3"`

### Resource Attributes Structure

Resource attributes define specific instances and their allowed actions:

```typescript
const resourceObj: ResourceAttributes = {
  dashboard: [
    { id: "dashboard-1", permissions: ["write"] },
    { id: "dashboard-2", permissions: ["read"] }
  ],
  room: [
    { id: "room-1", permissions: ["read"] },
    { id: "room-2", permissions: ["read", "write"] }
  ]
};
```

## Usage

### 1. Service Integration

Add the ABAC mixin to your Moleculer service:

```typescript
import { Service, ServiceBroker, Context } from "moleculer";
import { AbacMixin } from "../mixins/abac/abac.mixin";

export class DashboardService extends Service {
  constructor(broker: ServiceBroker) {
    super(broker);
    
    this.parseServiceSchema({
      name: "dashboard",
      mixins: [AbacMixin],
      hooks: {
        before: {
          "*": [
            (ctx: Context) => {
              // Set user in context meta
              ctx.meta.user = getCurrentUser(ctx);
            },
            "checkPermissions" // This calls the ABAC permission check
          ]
        }
      },
      actions: {
        "dashboard-read": {
          meta: {
            abac: {
              action: "read",
              resource: {
                dashboard: "dashboard-1" // Specific resource instance
              }
            }
          },
          handler(ctx: Context) {
            // Action implementation
          }
        }
      }
    });
  }
}
```

### 2. Action Meta Configuration

Each action that requires authorization must define ABAC metadata:

```typescript
actions: {
  "dashboard-write": {
    meta: {
      abac: {
        action: "write",           // Action being performed
        resource: {
          dashboard: "dashboard-1"  // Resource and specific instance
        }
      }
    },
    handler(ctx: Context) {
      // Only users with 'write' permission on 'dashboard-1' can access
    }
  }
}
```

### 3. User Context Setup

Before calling `checkPermissions`, ensure the user is available in the context:

```typescript
hooks: {
  before: {
    "*": [
      (ctx: Context) => {
        const userId = ctx.params.userId;
        const user = users.get(userId);
        if (!user) {
          throw new Error("User not found");
        }
        ctx.meta.user = user; // Required for ABAC
      },
      "checkPermissions"
    ]
  }
}
```

## Permission Flow

1. **User Authentication**: User is identified and their roles are determined
2. **Resource Definition**: Resource attributes are defined (hardcoded or dynamic)
3. **Ability Creation**: CASL abilities are created using `defineRulesFor(user, resourceObj)`
4. **Permission Check**: The mixin checks if `ability.can(action, subject, condition)`
5. **Access Control**: Access is granted or denied based on the permission check

## Advanced Usage

### Dynamic Resource Attributes

You can dynamically define resource attributes based on context:

```typescript
// In the mixin, you could modify to accept dynamic resources
const resourceObj = getDynamicResourceAttributes(ctx);
const ability = defineRulesFor(user, resourceObj);
```

### Multiple Resource Types

Handle multiple resource types in a single action:

```typescript
meta: {
  abac: {
    action: "read",
    resource: {
      dashboard: "dashboard-1",
      room: "room-2"
    }
  }
}
```

### Conditional Permissions

The system supports conditional permissions based on resource attributes:

```typescript
// This grants 'write' permission only on dashboard-1
can("write", "dashboard", { dashboard: "dashboard-1" });
```

## Error Handling

The mixin throws specific errors:

- **401 UNAUTHORIZED**: No user in context
- **403 FORBIDDEN**: User lacks required permissions
- **500 ABAC_META_MISSING**: Action missing ABAC metadata

## Best Practices

1. **Consistent Naming**: Use consistent resource and action names across your application
2. **Granular Permissions**: Define specific permissions rather than broad ones
3. **Resource Attributes**: Use meaningful resource IDs that reflect your domain
4. **Error Handling**: Implement proper error handling for authorization failures
5. **Testing**: Test permission scenarios thoroughly with different user roles

## Example Scenarios

### Scenario 1: Multi-tenant Dashboard Access
```typescript
// User with admin role can access multiple dashboards
"admin": ["dashboard:read|write|update|delete"]

// Resource attributes define specific tenant dashboards
resourceObj: {
  dashboard: [
    { id: "tenant-1-dashboard", permissions: ["read", "write"] },
    { id: "tenant-2-dashboard", permissions: ["read"] }
  ]
}
```

### Scenario 2: Room-based Access Control
```typescript
// Different users have different access to rooms
resourceObj: {
  room: [
    { id: "conference-room-1", permissions: ["read", "book"] },
    { id: "private-office-1", permissions: ["read"] }
  ]
}
```

## Integration with Authentication Systems

The ABAC mixin can be integrated with various authentication systems:

- **JWT Tokens**: Extract user information from JWT claims
- **Session-based**: Get user from session store
- **External Auth**: Integrate with OAuth, LDAP, or other auth providers
- **Zitadel**: Works with Zitadel OIDC authentication (as used in this project)

## Performance Considerations

- **Ability Caching**: Consider caching abilities for frequently accessed users
- **Resource Loading**: Optimize resource attribute loading for large datasets
- **Permission Calculation**: Pre-calculate permissions where possible

## Troubleshooting

### Common Issues

1. **Missing User Context**: Ensure `ctx.meta.user` is set before calling `checkPermissions`
2. **Invalid ABAC Meta**: Verify action metadata includes both `action` and `resource`
3. **Permission Format**: Check role-permissions.json format follows `resource:action1|action2`
4. **Resource Mismatch**: Ensure resource IDs in metadata match those in resource attributes

### Debug Tips

- Enable console logging to see ability rules and permission checks
- Use CASL's built-in debugging features
- Verify role-permissions.json is loaded correctly
- Check resource attribute structure matches expected format

## Future Enhancements

Potential improvements for the ABAC system:

1. **Dynamic Resource Loading**: Load resource attributes from database
2. **Policy Engine**: Implement more complex policy evaluation
3. **Audit Logging**: Track permission checks and access attempts
4. **Performance Optimization**: Add caching layers for abilities and resources
5. **UI Integration**: Build admin interfaces for managing permissions

---

This ABAC mixin provides a robust foundation for implementing fine-grained access control in Moleculer.js applications, enabling secure and flexible authorization based on user roles and resource attributes.