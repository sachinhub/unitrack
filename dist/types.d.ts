export interface TrackingEvent {
    timestamp: string;
    status: string;
    location: string;
    description: string;
}
export interface TrackingResult {
    trackingNumber: string;
    provider: string;
    status: string;
    currentLocation?: string;
    estimatedDelivery?: string;
    events: TrackingEvent[];
    success: boolean;
    error?: string;
}
export interface TrackingProvider {
    name: string;
    identify(trackingNumber: string): boolean;
    track(trackingNumber: string): Promise<TrackingResult>;
}
//# sourceMappingURL=types.d.ts.map