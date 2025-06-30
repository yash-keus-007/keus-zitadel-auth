import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt, StrategyOptions } from "passport-jwt";
import jwksRsa from "jwks-rsa";
import { zitaDelConfig } from "../config/authConfig";
import { users } from "../db/users";

interface JwtPayload {
  sub: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  name?: string;
  email_verified?: boolean;
  [key: string]: any;
}

const options: StrategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKeyProvider: jwksRsa.passportJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 20,
    jwksUri: `${zitaDelConfig.issuer}/oauth/v2/keys`, // ZITADEL JWKS endpoint
  }),
  algorithms: ["RS256"],
  issuer: zitaDelConfig.issuer,
};

passport.use(
  new JwtStrategy(options, (jwtPayload: JwtPayload, done) => {
    console.log("JWT Payload:", jwtPayload);
    const userInfo = users.get(jwtPayload.sub) || {};

    const projectRoles = jwtPayload["urn:zitadel:iam:org:project:roles"] ?? {};
    const roles = Object.keys(projectRoles);

    const user = {
      id: jwtPayload.sub,
      userName: userInfo?.preferred_username || jwtPayload?.preferred_username || null,
      emailVerified: userInfo?.email_verified ?? jwtPayload?.email_verified ?? null,
      email: userInfo?.email || jwtPayload?.email || null,
      givenName: userInfo?.given_name || jwtPayload?.given_name || null,
      familyName: userInfo?.family_name || jwtPayload?.family_name || null,
      name: userInfo?.name || jwtPayload?.name || null,
      roles,
    };

    return done(null, user);
  })
);

export default passport;
