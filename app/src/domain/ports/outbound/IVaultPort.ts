export interface JwtSecrets {
  privateKey: string;
  publicKey: string;
}

export interface DbSecrets {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

export interface IVaultPort {
  getJwtSecrets(): Promise<JwtSecrets>;
  getDbSecrets(): Promise<DbSecrets>;
  isHealthy(): Promise<boolean>;
}
