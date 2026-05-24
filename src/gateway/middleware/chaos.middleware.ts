import { Request, Response, NextFunction } from 'express';

/**
 * Chaos Middleware for Lot 4 (Robustness Testing)
 * Simulates extreme network latency and artificial packet drop.
 */
export const chaosMiddleware = (options: { failureRate: number, maxLatencyMs: number }) => {
    return (req: Request, res: Response, next: NextFunction) => {
        // Strict gate for automated chaos testing. 
        // Prevents normal frontend users from experiencing demo failures.
        if (req.headers['x-chaos-enabled'] !== 'true') {
            return next();
        }

        const isFailure = Math.random() < options.failureRate;
        const latency = Math.floor(Math.random() * options.maxLatencyMs);

        setTimeout(() => {
            if (isFailure) {
                console.error(`[CHAOS MONKEY] Dropping request ${req.method} ${req.originalUrl} with 503 Availability Error!`);
                return res.status(503).json({ 
                    error: 'chaos_monkey_induced_failure', 
                    message: 'Service Temporarily Unavailable (Simulated Node Outage)' 
                });
            }
            next();
        }, latency);
    };
};
