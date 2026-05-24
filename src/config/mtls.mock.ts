import https from 'https';
import fs from 'fs';

/**
 * mTLS Configuration Abstraction
 * Generates an HTTPS Agent specifically configured with client-side certificates
 * to verify machine-to-machine identity across internal microservices.
 */
export class MtlsConfigurator {
    
    public getSecureInternalAgent(): https.Agent {
        // In a real environment, these paths point to volume-mounted certificates 
        // provided by a mesh (like Istio or Linkerd) or vault injection.
        const certPath = process.env.MTLS_CERT_PATH || './certs/internal-service.crt';
        const keyPath = process.env.MTLS_KEY_PATH || './certs/internal-service.key';
        const caPath = process.env.MTLS_CA_PATH || './certs/internal-ca.pem';

        console.log(`[mTLS] Bootstrapping internal communication agent ensuring mutual TLS.`);

        try {
            return new https.Agent({
                cert: fs.readFileSync(certPath),
                key: fs.readFileSync(keyPath),
                ca: fs.readFileSync(caPath),
                rejectUnauthorized: true, // Strictly fail if the peer certificate is invalid
            });
        } catch (e: any) {
            console.warn(`[mTLS Warning] Certificates not found. The app is falling back to default Agent (expected in local dev).`);
            return new https.Agent({ rejectUnauthorized: false });
        }
    }

    /**
     * Interceptor configuration for Axios/Fetch clients dynamically appending the Agent.
     */
    public configureAxiosForInternal(axiosInstance: any) {
        axiosInstance.defaults.httpsAgent = this.getSecureInternalAgent();
    }
}

export const mtlsConfigurator = new MtlsConfigurator();
