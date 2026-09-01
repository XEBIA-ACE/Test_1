export interface LogoutCommand {
  userId: string;
  accessToken: string;
  refreshToken?: string;
}
