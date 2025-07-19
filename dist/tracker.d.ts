import { TrackingResult } from './types.js';
export declare class UniversalTracker {
    private providers;
    constructor();
    private identifyProvider;
    track(trackingNumber: string): Promise<TrackingResult>;
    getSupportedProviders(): string[];
}
//# sourceMappingURL=tracker.d.ts.map