import { CryptoUtils, JWKInterface } from '../models/auth-js';

// Function to generate random bytes of specified length
function randombytes(length: number): string {
  const bytes = new Uint8Array(length);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export default class SPACryptoUtils implements CryptoUtils<Buffer | string> {
  /**
     * Get URL encoded string.
     *
     * @returns {string} base 64 url encoded value.
     */
  public base64URLEncode(value: string): string {
    return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    // return base64url.encode(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  public base64URLDecode(value: string): string {
    return atob(value).toString();
    // return base64url.decode(value).toString();
  }

  public async hashSha256(data: string): Promise<string | Buffer> {
    const textAsBuffer = new TextEncoder().encode(input);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', textAsBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray
      .map((item) => item.toString(16).padStart(2, '0'))
      .join('');
    return hash;
  }

  public generateRandomBytes(length: number): string | Buffer {
    return randombytes(length);
  }

  public verifyJwt(
    idToken: string,
    jwk: Partial<JWKInterface>,
    algorithms: string[],
    clientID: string,
    issuer: string,
    subject: string,
    clockTolerance?: number,
    validateJwtIssuer?: boolean,
  ): Promise<boolean> {
    const jwtVerifyOptions = {
      algorithms,
      audience: clientID,
      clockTolerance,
      subject,
    };

    if (validateJwtIssuer ?? true) {
      jwtVerifyOptions.issuer = issuer;
    }

    return jwtVerify(
      idToken,
      createLocalJWKSet({
        keys: [jwk],
      }),
      jwtVerifyOptions,
    ).then(() => Promise.resolve(true)).catch((error) => Promise.reject(new AsgardeoAuthException(
      'SPA-CRYPTO-UTILS-VJ-IV01',
      error?.reason ?? JSON.stringify(error),
      `${error?.code} ${error?.claim}`,
    )));
  }
}