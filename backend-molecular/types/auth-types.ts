export type DecodedToken = {
  sub: string;
  preferred_username: string;
  email_verified: boolean;
  email: string;
  given_name: string;
  family_name: string;
  name: string;
  [key: string]: any;
};