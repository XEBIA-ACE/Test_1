import axios from 'axios';
import { config } from '../../../../config';

export interface OAuthUserProfile {
  provider: 'google' | 'facebook';
  providerId: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Lightweight OAuth2 adapter.
 * In production, use @fastify/oauth2 plugin for the full PKCE / OIDC flow.
 * This adapter handles the token exchange and profile fetch steps.
 */
export class OAuthAdapter {
  async exchangeGoogleCode(code: string): Promise<OAuthUserProfile> {
    // Exchange authorization code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      code,
      client_id: config.oauth.google.clientId,
      client_secret: config.oauth.google.clientSecret,
      redirect_uri: config.oauth.google.callbackUrl,
      grant_type: 'authorization_code',
    });

    const { access_token } = tokenResponse.data as { access_token: string };

    // Fetch user profile
    const profileResponse = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const profile = profileResponse.data as {
      sub: string;
      email?: string;
      name?: string;
      picture?: string;
    };

    return {
      provider: 'google',
      providerId: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    };
  }

  async exchangeFacebookCode(code: string): Promise<OAuthUserProfile> {
    const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
      params: {
        client_id: config.oauth.facebook.clientId,
        client_secret: config.oauth.facebook.clientSecret,
        redirect_uri: config.oauth.facebook.callbackUrl,
        code,
      },
    });

    const { access_token } = tokenResponse.data as { access_token: string };

    const profileResponse = await axios.get('https://graph.facebook.com/me', {
      params: {
        fields: 'id,email,name,picture',
        access_token,
      },
    });

    const profile = profileResponse.data as {
      id: string;
      email?: string;
      name?: string;
      picture?: { data?: { url?: string } };
    };

    return {
      provider: 'facebook',
      providerId: profile.id,
      email: profile.email,
      name: profile.name,
      picture: profile.picture?.data?.url,
    };
  }
}
