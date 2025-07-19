import { TrackingProvider, TrackingResult } from '../types.js';
export declare class ShipwayProvider implements TrackingProvider {
    name: string;
    private readonly CUSTOMER_SUBDOMAINS;
    identify(trackingNumber: string): boolean;
    track(trackingNumber: string): Promise<TrackingResult>;
    private tryCustomerSubdomain;
    private parseTrackingResponse;
}
//# sourceMappingURL=shipway.d.ts.map