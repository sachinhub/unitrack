import { TrackingProvider, TrackingResult } from './types.js';
import { ProShipProvider } from './providers/proship.js';
import { ShipwayProvider } from './providers/shipway.js';

export class UniversalTracker {
  private providers: TrackingProvider[] = [];

  constructor() {
    this.providers = [
      new ProShipProvider(),
      new ShipwayProvider()
    ];
  }

  private identifyProvider(trackingNumber: string): TrackingProvider | null {
    for (const provider of this.providers) {
      if (provider.identify(trackingNumber)) {
        return provider;
      }
    }
    return null;
  }

  async track(trackingNumber: string): Promise<TrackingResult> {
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

  getSupportedProviders(): string[] {
    return this.providers.map(p => p.name);
  }
}