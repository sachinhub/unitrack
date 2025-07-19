import { UniversalTracker } from './dist/tracker.js';

const tracker = new UniversalTracker();

console.log('Testing UniTrack with ProShip tracking number: PRVP0000230128');
console.log('Supported providers:', tracker.getSupportedProviders());

try {
  const result = await tracker.track('PRVP0000230127');
  // console.log('\nTracking Result:');
  // console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Error:', error.message);
}