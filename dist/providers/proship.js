import axios from 'axios';
export class ProShipProvider {
    name = 'ProShip';
    API_ENDPOINTS = [
        'https://r1fiocxmcf.execute-api.ap-south-1.amazonaws.com/proship/track_waybill_p',
        'https://proship.prozo.com/api/order/tracking/fetchTrackingDetails',
    ];
    identify(trackingNumber) {
        return trackingNumber.startsWith('PRV') || !!trackingNumber.match(/^PRV[A-Z]\d{10}$/);
    }
    async track(trackingNumber) {
        // Try multiple API approaches
        for (const endpoint of this.API_ENDPOINTS) {
            try {
                const result = await this.tryApiEndpoint(endpoint, trackingNumber);
                if (result.success) {
                    return result;
                }
            }
            catch (error) {
                console.error(`Failed to track via ${endpoint}:`, error);
                continue;
            }
        }
        // If all API calls fail, return error
        return {
            trackingNumber,
            provider: this.name,
            status: 'Error',
            events: [],
            success: false,
            error: 'Unable to retrieve tracking information from ProShip API'
        };
    }
    async tryApiEndpoint(endpoint, trackingNumber) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Origin': 'https://tracking.proship.in',
            'Referer': 'https://tracking.proship.in/',
            'Accept': 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.9',
        };
        // Try different request formats based on the endpoint
        const requestMethods = [];
        if (endpoint.includes('track_waybill_p')) {
            // AWS Lambda endpoint - use queryStringParameters format
            requestMethods.push(() => axios.post(endpoint, {
                queryStringParameters: { waybills: trackingNumber }
            }, { headers, timeout: 10000 }), () => axios.post(endpoint, {
                queryStringParameters: { awbNumber: trackingNumber }
            }, { headers, timeout: 10000 }));
        }
        else if (endpoint.includes('proship.prozo.com')) {
            // Prozo API endpoint
            requestMethods.push(() => axios.post(endpoint, {
                queryStringParameters: {
                    waybills: trackingNumber
                }
            }, { headers, timeout: 10000 }), () => axios.post(endpoint, {
                trackingNumber: trackingNumber
            }, { headers, timeout: 10000 }), () => axios.get(`${endpoint}?awbNumber=${trackingNumber}`, { headers, timeout: 10000 }));
        }
        // Fallback methods
        requestMethods.push(() => axios.post(endpoint, { awbNo: trackingNumber }, { headers, timeout: 10000 }), () => axios.get(`${endpoint}?awbNo=${trackingNumber}`, { headers, timeout: 10000 }));
        for (const method of requestMethods) {
            try {
                const response = await method();
                return this.parseTrackingResponse(response.data, trackingNumber);
            }
            catch (error) {
                // Continue to next method
                continue;
            }
        }
        throw new Error('All request methods failed');
    }
    parseTrackingResponse(data, trackingNumber) {
        try {
            const events = [];
            let status = 'Unknown';
            let currentLocation = '';
            let estimatedDelivery = '';
            if (typeof data === 'object' && data !== null) {
                // Handle ProShip API response format
                if (data.body && typeof data.body === 'string') {
                    // AWS Lambda response with stringified body
                    try {
                        const bodyData = JSON.parse(data.body);
                        return this.parseTrackingResponse(bodyData, trackingNumber);
                    }
                    catch (e) {
                        // If body parsing fails, continue with original data
                    }
                }
                // Extract order details from ProShip response
                const orderDetails = data.orderDetails || data.order_details || data;
                if (orderDetails) {
                    // Status mapping
                    if (orderDetails.status || orderDetails.orderStatus) {
                        const rawStatus = orderDetails.status || orderDetails.orderStatus;
                        status = this.mapProShipStatus(rawStatus);
                    }
                    // Location
                    if (orderDetails.currentLocation || orderDetails.current_location || orderDetails.location) {
                        currentLocation = orderDetails.currentLocation || orderDetails.current_location || orderDetails.location;
                    }
                    // Delivery date
                    if (orderDetails.deliveryDate || orderDetails.estimated_delivery || orderDetails.estimatedDelivery) {
                        estimatedDelivery = orderDetails.deliveryDate || orderDetails.estimated_delivery || orderDetails.estimatedDelivery;
                    }
                    // Parse tracking events
                    const trackingHistory = orderDetails.trackingHistory || orderDetails.tracking_history ||
                        orderDetails.trackingDetails || orderDetails.events || [];
                    if (Array.isArray(trackingHistory)) {
                        events.push(...trackingHistory.map((event) => ({
                            timestamp: event.createdAt || event.timestamp || event.date || event.created_at || new Date().toISOString(),
                            status: this.mapProShipStatus(event.status || event.activity || event.statusName || 'Unknown'),
                            location: event.location || event.place || event.hubName || event.hub_name || currentLocation || '',
                            description: event.description || event.activity || event.remarks || event.statusName ||
                                event.status || 'Package tracking update'
                        })));
                    }
                    // If no events but we have status, create a single event
                    if (events.length === 0 && status !== 'Unknown') {
                        events.push({
                            timestamp: new Date().toISOString(),
                            status: status,
                            location: currentLocation,
                            description: `Package status: ${status}`
                        });
                    }
                }
                // Handle specific API responses
                if (data.message && data.message.Status === 'SUCCESS') {
                    const waybillDetails = data.message.waybillDetails || [];
                    if (waybillDetails.length > 0) {
                        const detail = waybillDetails[0];
                        // Extract current status
                        if (detail.currentStatus) {
                            status = this.mapProShipStatus(detail.currentStatus);
                        }
                        // Extract current location
                        if (detail.currentLocation) {
                            currentLocation = detail.currentLocation;
                        }
                        // Extract estimated delivery date
                        if (detail.edd) {
                            estimatedDelivery = detail.edd;
                        }
                        // Parse order history as tracking events
                        if (detail.order_history && Array.isArray(detail.order_history)) {
                            events.push(...detail.order_history.map((event) => ({
                                timestamp: event.timestamp || event.creationDate || new Date().toISOString(),
                                status: this.mapProShipStatus(event.orderStatusDescription || event.orderStatusEnum || 'Unknown'),
                                location: event.currentLocation || '',
                                description: event.orderStatusDescription || event.remark || 'Package tracking update'
                            })));
                        }
                        // If no events but we have status, create a single event
                        if (events.length === 0 && status !== 'Unknown') {
                            events.push({
                                timestamp: detail.statusDate || new Date().toISOString(),
                                status: status,
                                location: currentLocation,
                                description: `Package status: ${status}`
                            });
                        }
                        return {
                            trackingNumber,
                            provider: this.name,
                            status,
                            currentLocation,
                            estimatedDelivery,
                            events,
                            success: true
                        };
                    }
                }
                // Handle other error responses
                if (data.error || (data.message && typeof data.message === 'string')) {
                    throw new Error(data.error || data.message);
                }
                return {
                    trackingNumber,
                    provider: this.name,
                    status,
                    currentLocation,
                    estimatedDelivery,
                    events,
                    success: true
                };
            }
            throw new Error('Unexpected response format');
        }
        catch (error) {
            throw new Error(`Failed to parse tracking response: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    mapProShipStatus(status) {
        if (!status)
            return 'Unknown';
        const statusLower = status.toLowerCase();
        // Map ProShip status values to standard statuses
        if (statusLower.includes('delivered') || statusLower.includes('delivery')) {
            return 'Delivered';
        }
        else if (statusLower.includes('transit') || statusLower.includes('moving')) {
            return 'In Transit';
        }
        else if (statusLower.includes('pickup') || statusLower.includes('picked')) {
            return 'Picked Up';
        }
        else if (statusLower.includes('dispatched') || statusLower.includes('shipped')) {
            return 'Shipped';
        }
        else if (statusLower.includes('out for delivery') || statusLower.includes('ofd')) {
            return 'Out for Delivery';
        }
        else if (statusLower.includes('return') || statusLower.includes('rto')) {
            return 'Returned';
        }
        else if (statusLower.includes('cancel')) {
            return 'Cancelled';
        }
        else if (statusLower.includes('pending')) {
            return 'Pending';
        }
        // Return the original status if no mapping found
        return status;
    }
}
//# sourceMappingURL=proship.js.map