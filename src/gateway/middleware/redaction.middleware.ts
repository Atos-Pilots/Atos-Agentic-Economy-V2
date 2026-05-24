import { Request, Response, NextFunction } from 'express';

// Fields we want to redact before logging
const SENSITIVE_FIELDS = ['subject_ref', 'merchant_id', 'device_id', 'sd_jwt', 'jwt'];

/**
 * Sovereign Observability Middleware:
 * Masks sensitive identifiers to protect privacy (GDPR / eIDAS data minimization)
 * before anything is logged to the system's output streams.
 */
export const redactionMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // We capture the original send to intercept the response payload
    const originalSend = res.send;
    
    // We copy the body to safely log incoming payloads without mutating them
    let redactedBody = { ...req.body };
    
    // Redact incoming keys
    Object.keys(redactedBody).forEach(key => {
        if (SENSITIVE_FIELDS.includes(key)) {
            redactedBody[key] = '[REDACTED]';
        }
    });

    console.log(`\n[API Gateway] => ${req.method} ${req.url} | Body:`, JSON.stringify(redactedBody));

    res.send = function (body: any): Response {
        let parsedBody;
        try {
            parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
        } catch (e) {
            parsedBody = body;
        }

        if (parsedBody && typeof parsedBody === 'object') {
            let redactedResBody = { ...parsedBody };
            
            // Deep redact (simplistic for our depth-1 payloads)
            if (redactedResBody.data) {
                 let redactedData = { ...redactedResBody.data };
                 Object.keys(redactedData).forEach(key => {
                     if (SENSITIVE_FIELDS.includes(key) || key.includes('jwt')) {
                         redactedData[key] = '[REDACTED]';
                     }
                 });
                 if (redactedData.mandate && redactedData.mandate.subject_ref) {
                     redactedData.mandate.subject_ref = '[REDACTED]';
                 }
                 redactedResBody.data = redactedData;
            }

            console.log(`[API Gateway] <= Status: ${res.statusCode} | Response:`, JSON.stringify(redactedResBody));
        } else {
             console.log(`[API Gateway] <= Status: ${res.statusCode} | Body format non-JSON`);
        }

        return originalSend.call(this, body);
    };

    next();
};
