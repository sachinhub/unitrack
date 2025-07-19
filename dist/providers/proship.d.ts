import { TrackingProvider, TrackingResult } from '../types.js';
export declare class ProShipProvider implements TrackingProvider {
    name: string;
    private readonly API_ENDPOINTS;
    identify(trackingNumber: string): boolean;
    track(trackingNumber: string): Promise<TrackingResult>;
    private tryApiEndpoint;
    private parseTrackingResponse;
    private mapProShipStatus;
}
//# sourceMappingURL=proship.d.ts.map