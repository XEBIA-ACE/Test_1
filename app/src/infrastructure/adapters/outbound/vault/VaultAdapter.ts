import nodeVault from 'node-vault';
import { IVaultPort, JwtSecrets, DbSecrets } from '../../../../domain/ports/outbound/IVaultPort';
import { config } from '../../../../config';

export class VaultAdapter implements IVaultPort {
  private readonly client: ReturnType<typeof nodeVault>;

  constructor() {
    this.client = nodeVault({
      apiVersion: 'v1',
      endpoint: config.vault.addr,
      token: config.vault.token,
    });
  }

  async getJwtSecrets(): Promise<JwtSecrets> {
    const response = await this.client.read(config.vault.jwtSecretPath);
    const data = response.data?.data ?? response.data;
    return {
      privateKey: data.private_key as string,
      publicKey: data.public_key as string,
    };
  }

  async getDbSecrets(): Promise<DbSecrets> {
    const response = await this.client.read(config.vault.dbSecretPath);
    const data = response.data?.data ?? response.data;
    return {
      host: data.host as string,
      port: Number(data.port),
      database: data.database as string,
      username: data.username as string,
      password: data.password as string,
    };
  }

  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.initialized && !health.sealed;
    } catch {
      return false;
    }
  }
}
