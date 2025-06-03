import { generatePairAnalysis } from './src/lib/dynamic-analysis'; // Assuming script is in project root /app
async function runTests() {
    console.log('--- Starting dynamic analysis tests ---');
    const testCases = [
        { from: 'USD', to: 'THB', days: 365 * 5, label: 'USD/THB (5 years)' },
        { from: 'EUR', to: 'USD', days: 365 * 5, label: 'EUR/USD (5 years)' },
        { from: 'AUD', to: 'CAD', days: 365 * 5, label: 'AUD/CAD (5 years)' },
        { from: 'USD', to: 'JPY', days: 365 * 1, label: 'USD/JPY (1 year)' },
        { from: 'XYZ', to: 'ABC', days: 365 * 5, label: 'XYZ/ABC (invalid pair)' },
        { from: 'USD', to: 'THB', days: 30, label: 'USD/THB (30 days)' },
    ];
    for (const tc of testCases) {
        console.log(`\n--- Testing ${tc.label} ---`);
        try {
            const data = await generatePairAnalysis(tc.from, tc.to, tc.days);
            console.log(`Data for ${tc.from}/${tc.to} (${tc.days} days):`);
            console.log(JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error(`Error testing ${tc.label}: ${error.message}`);
            console.log(JSON.stringify(null, null, 2)); // Log null for error cases as per example
        }
    }
    console.log('\n--- All dynamic analysis tests completed ---');
}
runTests().catch(error => {
    console.error('Critical error during test execution:', error);
});
