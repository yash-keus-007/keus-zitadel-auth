import axios from "axios";
import path from "path";
import fs from "fs";
import { zitaDelConfig } from "../config/authConfig";
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { DecodedToken } from "../types/auth-types";
const qs = new URLSearchParams();

export const codeVerifiers = new Map();

const ROLE_PERMISSIONS_FILE_PATH = path.join(__dirname, 'role-permissions.json');
const ROUTE_PERMISSIONS_FILE_PATH = path.join(__dirname, 'route-permissions.json');


export const getFileData = (filePath: string) => {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data);
}


export const generatePKCE = () => {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return { codeVerifier, codeChallenge };
}
export const generateJWTAssertion = () => {
    if (!zitaDelConfig.jwt.key || !zitaDelConfig.jwt.keyId) {
        throw new Error('JWT key or keyId not configured');
    }

    const now = Math.floor(Date.now() / 1000);
    const payload = {
        iss: zitaDelConfig.jwt.clientId,
        sub: zitaDelConfig.jwt.clientId,
        aud: zitaDelConfig.issuer,
        iat: now,
        exp: now + 600000000, 
        jti: crypto.randomUUID()
    };

    return jwt.sign(payload, zitaDelConfig.jwt.key, {
        algorithm: 'RS256',
        keyid: zitaDelConfig.jwt.keyId
    });
}

export const generateServiceUserAccessToken = async () => {
  try {
    qs.append('grant_type', zitaDelConfig.serviceUser.grant_type || "client_credentials");
    qs.append('client_id', zitaDelConfig.serviceUser.client_id || "");
    qs.append('client_secret', zitaDelConfig.serviceUser.client_secret || "");
    qs.append('scope', zitaDelConfig.serviceUser.scope || "");
    const tokenResponse = await axios.post(
      `${zitaDelConfig.issuer}/oauth/v2/token`,
      qs.toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    // console.log("Service User Token Response:", tokenResponse.data);
    const { access_token, id_token, refresh_token } = tokenResponse.data;
    return access_token;
  } catch (error) {
    console.error("Error generating service user access token:", error);
    throw new Error('Failed to generate service user access token');
  }
}
export const getTokenFromHeader = (req:any, res:any, next:any) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  req.accessToken = token;
  next();
};

export const getUserInfo = async (accessToken:string) => {
  try {

    console.log("calling get profile------------");
    console.log("Access token:", accessToken.substring(0, 20) + "...");
    console.log("Userinfo endpoint:", `${zitaDelConfig.issuer}/oidc/v1/userinfo`);
    
    const userInfoResponse = await axios.get(
      `${zitaDelConfig.issuer}/oidc/v1/userinfo`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log("after get profile------------");
    console.log("User Info Response status:", userInfoResponse.status);
    // console.log("User Info Response:", userInfoResponse.data);
    let userRoutePermissions: string[] = [];
    const routePermissions = getFileData(ROUTE_PERMISSIONS_FILE_PATH);
    Object.keys(userInfoResponse.data["urn:zitadel:iam:org:project:roles"]).forEach(role => {
      Object.keys(routePermissions.routes).forEach(route => {
        if (routePermissions.routes[route].includes(role)) {
          userRoutePermissions.push(route);
        }
      });
    });

    // console.log("User Route Permissions:", userInfoResponse.data["urn:zitadel:iam:org:project:roles"]);

    const userDetails = {
      id: userInfoResponse.data.sub,
      email: userInfoResponse.data.email,
      name: userInfoResponse.data.name,
      firstName: userInfoResponse.data.given_name,
      lastName: userInfoResponse.data.family_name,
      picture: userInfoResponse.data.picture,
      roles: Object.keys(userInfoResponse.data["urn:zitadel:iam:org:project:roles"]),
      routePermissions: userRoutePermissions
    };

    // console.log("user details---", userDetails)
    return userDetails;
  } catch (error: any) {
    console.error("Error fetching user info:");
    console.error("Error message:", error.message);
    
    // Re-throw the original error so it can be caught by the calling function
    throw error;
  }
};


export const getRoutePermissions  = (roles: string[]) => {
  try {
    let userRoutePermissions: string[] = [];
    const routePermissions = getFileData(ROUTE_PERMISSIONS_FILE_PATH);
    console.log("Route Permissions:", roles, routePermissions);
    roles.forEach(role => {
      Object.keys(routePermissions.routes).forEach(route => {
        if (routePermissions.routes[route].includes(role)) {
          userRoutePermissions.push(route);
        }
      });
    });

    return userRoutePermissions;
  } catch (error) {
    console.error("Error reading route permissions from JSON DB:", error);
    return {};
    
  }
}

const getUserRoles = async (accessToken:string) => {
  const userDetails = await getUserInfo(accessToken);

  if (!userDetails) {
    console.error("User details not found");
    return [];
  }
  if (userDetails) return userDetails.roles || [];
};


export const checkPermission = (requiredPermissions:string[] = []) => {
  return async (req:any, res:any, next:any) => {
    try {
      const userRoles = req?.user?.roles || [];
      console.log("User Roles:", userRoles);
      let userPermissions: string[] = [];
      const rolePermissions = getFileData(ROLE_PERMISSIONS_FILE_PATH);
      userRoles?.forEach((role:string) => {
        const perms = rolePermissions.roles[role] || [];
        userPermissions = [...userPermissions, ...perms];
      });
      console.log("User Permissions:", userPermissions);
      const hasPermission = requiredPermissions.some(p => userPermissions.includes(p));

      if (!hasPermission) {
        return res.status(403).json({ success: false, message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (err:any) {
      console.error("Permission check failed:", err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

export const addRoleToJsonDB = (roles:string[]) => {
  const JSON_DB_PATH = path.join(__dirname, 'role-permissions.json');

  const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
  roles.forEach(role => {
    if (!data.roles[role]) {
      data.roles[role] = [];
    }
  });
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
};

export const removeRoleFromJsonDB = (roles:string[]) => {
  const JSON_DB_PATH = path.join(__dirname, 'role-permissions.json');
  const data = JSON.parse(fs.readFileSync(JSON_DB_PATH, 'utf-8'));
  roles.forEach(role => {
    if (data.roles[role]) {
      delete data.roles[role];
    }
  });
  fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
};


export const getProjectRoles = async (projectId: string) => {
  try {

    const serviceUserToken = await generateServiceUserAccessToken();
    console.log("Service User Token:",`${zitaDelConfig.issuer}/management/v1/projects/${projectId}/roles/_search`, serviceUserToken,projectId
      
    );
    const response = await axios.post(`${zitaDelConfig.issuer}/management/v1/projects/${projectId}/roles/_search`,{}, {
      headers: {
        "Authorization": `Bearer ${serviceUserToken}`
      }
    })
    console.log("Project Roles Response:", response.data);
    return response?.data?.result.map((obj:any) => obj.key) || [];
  } catch (error:any) {
    console.error("Error fetching project roles:", error?.message);
    throw new Error('Failed to fetch project roles');

  }
}


export const getDbProjectRoles = () => {
  try {
    const rolePermissions = getFileData(ROLE_PERMISSIONS_FILE_PATH);
    return Object.keys(rolePermissions.roles);
  } catch (error) {
    console.error("Error reading project roles from JSON DB:", error);
    return [];
  }
}



export const extractUserInfoAndRoles = (decodedToken: DecodedToken) => {
  const userRoles: Set<string> = new Set();

  const roleSources = [
    `urn:zitadel:iam:org:project:${zitaDelConfig.projectId}:roles`,
    'urn:zitadel:iam:org:project:roles'
  ];

  for (const key of roleSources) {
    const rolesObj = decodedToken[key];
    if (rolesObj && typeof rolesObj === 'object') {
      Object.keys(rolesObj).forEach(role => userRoles.add(role));
    }
  }

  return {
    id: decodedToken?.sub,
    userName: decodedToken?.preferred_username,
    emailVerified: decodedToken?.email_verified,
    email: decodedToken?.email,
    givenName: decodedToken?.given_name,
    familyName: decodedToken?.family_name,
    name: decodedToken?.name,
    roles: Array.from(userRoles)
  };
}

