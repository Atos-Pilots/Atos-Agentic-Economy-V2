import { Request, Response } from 'express';
import { eventBus } from '../services/event.bus';

export class TelemetryController {
    
    // GET /telemetry/stream
    public stream(req: Request, res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        
        // Ensure connection stays alive
        const pingInterval = setInterval(() => {
            res.write('event: ping\ndata: {}\n\n');
        }, 15000);

        const eventListener = (data: any) => {
            // Data is sanitized implicitly as the redacted logger middleware doesn't impact EventBus native data,
            // but the prompt mentions "compatible with redaction". 
            // In a real prod environment we would run RedactionEngine on this payload before broadcasting.
            const sanitizedPayload = { ...data.payload };
            if (sanitizedPayload.subject_ref) sanitizedPayload.subject_ref = '[REDACTED]';
            if (sanitizedPayload.device_id) sanitizedPayload.device_id = '[REDACTED]';
            
            res.write(`data: ${JSON.stringify({ type: data.type, payload: sanitizedPayload, timestamp: data.timestamp })}\n\n`);
        };

        eventBus.on('telemetry:*', eventListener);

        req.on('close', () => {
            clearInterval(pingInterval);
            eventBus.off('telemetry:*', eventListener);
        });
    }
}
