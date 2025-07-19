import { ProShipProvider } from './providers/proship.js';
import { ShipwayProvider } from './providers/shipway.js';
export class UniversalTracker {
    providers = [];
    constructor() {
        this.providers = [
            new ProShipProvider(),
            new ShipwayProvider()
        ];
    }
    identifyProvider(trackingNumber) {
        for (const provider of this.providers) {
            if (provider.identify(trackingNumber)) {
                return provider;
            }
        }
        return null;
    }
    async track(trackingNumber) {
        const cleanTrackingNumber = trackingNumber.trim().toUpperCase();
        const provider = this.identifyProvider(cleanTrackingNumber);
        if (!provider) {
            return {
                trackingNumber: cleanTrackingNumber,
                provider: 'Unknown',
                status: 'Provider Not Supported',
                events: [],
                success: false,
                error: 'No tracking provider found for this tracking number format'
            };
        }
        return await provider.track(cleanTrackingNumber);
    }
    getSupportedProviders() {
        return this.providers.map(p => p.name);
    }
}
//# sourceMappingURL=tracker.js.map