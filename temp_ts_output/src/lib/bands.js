import analysisDataJson from './full_analysis.json';
const fullAnalysisData = analysisDataJson;
export function getStaticBandColorConfig(bandName) {
    switch (bandName) {
        case "EXTREME":
            return {
                badgeClass: "bg-red-500 text-white hover:bg-red-600",
                borderColorClass: "border-red-500",
                switchColorClass: "data-[state=checked]:bg-red-500",
                toastClass: "bg-red-500 text-white",
                chartSettings: {
                    fillVar: "var(--band-extreme-area-bg)",
                    strokeVar: "var(--band-extreme-area-border)",
                    labelTextColorVar: "var(--band-extreme-text-color)",
                }
            };
        case "DEEP":
            return {
                badgeClass: "bg-purple-600 text-white hover:bg-purple-700",
                borderColorClass: "border-purple-600",
                switchColorClass: "data-[state=checked]:bg-purple-600",
                toastClass: "bg-purple-600 text-white",
                chartSettings: {
                    fillVar: "var(--band-deep-area-bg)",
                    strokeVar: "var(--band-deep-area-border)",
                    labelTextColorVar: "var(--band-deep-text-color)",
                }
            };
        case "OPPORTUNE":
            return {
                badgeClass: "bg-green-600 text-white hover:bg-green-700",
                borderColorClass: "border-green-600",
                switchColorClass: "data-[state=checked]:bg-green-600",
                toastClass: "bg-green-600 text-white",
                chartSettings: {
                    fillVar: "var(--band-opportune-area-bg)",
                    strokeVar: "var(--band-opportune-area-border)",
                    labelTextColorVar: "var(--band-opportune-text-color)",
                }
            };
        case "NEUTRAL":
            return {
                badgeClass: "bg-slate-500 text-white hover:bg-slate-600",
                borderColorClass: "border-slate-500",
                switchColorClass: "data-[state=checked]:bg-slate-500",
                chartSettings: {
                    fillVar: "var(--band-neutral-area-bg)",
                    strokeVar: "var(--band-neutral-area-border)",
                    labelTextColorVar: "var(--band-neutral-text-color)",
                }
            };
        case "RICH":
            return {
                badgeClass: "bg-yellow-400 text-black hover:bg-yellow-500", // text-black for yellow badge
                borderColorClass: "border-yellow-400",
                switchColorClass: "data-[state=checked]:bg-yellow-400",
                chartSettings: {
                    fillVar: "var(--band-rich-area-bg)",
                    strokeVar: "var(--band-rich-area-border)",
                    labelTextColorVar: "var(--band-rich-text-color)", // For chart label, consider if yellow text is readable on light yellow bg
                }
            };
        default: // Should not happen with typed BandName
            return {
                badgeClass: 'bg-gray-400 text-white',
                borderColorClass: 'border-gray-400',
                switchColorClass: 'data-[state=checked]:bg-gray-400',
                chartSettings: {
                    fillVar: 'hsla(0, 0%, 50%, 0.1)', // Fallback fill
                    strokeVar: 'hsla(0, 0%, 50%, 0.2)', // Fallback stroke
                    labelTextColorVar: 'hsl(0, 0%, 20%)', // Fallback text color (dark gray)
                }
            };
    }
}
const formatActionBrief = (actionBriefKey) => {
    if (!actionBriefKey)
        return "N/A";
    return actionBriefKey
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace("Usd", "USD");
};
const formatExampleAction = (exampleActionKey) => {
    if (!exampleActionKey)
        return "N/A";
    return exampleActionKey
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/Thb/g, 'THB')
        .replace(/Usd/g, 'USD')
        .replace(/Dca/g, 'DCA')
        .replace(/Approx /g, '≈ ')
        .replace(/k /g, 'k ');
};
const formatReason = (reasonKey) => {
    if (!reasonKey)
        return "No specific reason provided.";
    return reasonKey
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .replace(/ Usd /g, ' USD ')
        .replace(/ Thb /g, ' THB ');
};
const formatLevelDisplayName = (levelKey) => {
    if (levelKey === "USD-RICH")
        return "Rich"; // Keep this specific mapping if JSON uses "USD-RICH"
    if (!levelKey)
        return "N/A";
    // General case for other band names
    return levelKey.charAt(0).toUpperCase() + levelKey.slice(1).toLowerCase();
};
export const BANDS = fullAnalysisData.threshold_bands.map(bandData => {
    // Map "USD-RICH" from JSON to "RICH" for internal BandName type
    const name = bandData.level === "USD-RICH" ? "RICH" : bandData.level;
    let conditionFunc;
    let minRate = null;
    let maxRate = null;
    if (bandData.range.max === null && bandData.range.min !== null) {
        minRate = bandData.range.min;
        conditionFunc = (rate) => rate >= bandData.range.min;
    }
    else if (bandData.range.min === 0 && bandData.range.max !== null) { // Assuming 0 min implies less than or equal to max
        maxRate = bandData.range.max;
        conditionFunc = (rate) => rate <= bandData.range.max;
    }
    else if (bandData.range.min !== null && bandData.range.max !== null) {
        minRate = bandData.range.min;
        maxRate = bandData.range.max;
        conditionFunc = (rate) => rate >= bandData.range.min && rate <= bandData.range.max;
    }
    else {
        // Should not happen with current JSON structure
        conditionFunc = (_rate) => false;
    }
    const colorConfig = getStaticBandColorConfig(name);
    let rangeDisplayVal = "";
    if (maxRate === null && minRate !== null) {
        rangeDisplayVal = `> ${minRate.toFixed(1)} THB/USD`;
    }
    else if (minRate === 0 && maxRate !== null) {
        rangeDisplayVal = `≤ ${maxRate.toFixed(1)} THB/USD`;
    }
    else if (minRate !== null && maxRate !== null) {
        rangeDisplayVal = `${minRate.toFixed(1)} – ${maxRate.toFixed(1)} THB/USD`;
    }
    else {
        rangeDisplayVal = "N/A";
    }
    const actionText = formatActionBrief(bandData.action_brief);
    const exampleActionText = formatExampleAction(bandData.example_action);
    const reasonText = formatReason(bandData.reason);
    return {
        name: name,
        displayName: formatLevelDisplayName(bandData.level), // Use original level for display name formatting
        minRate,
        maxRate,
        condition: conditionFunc,
        action: actionText,
        exampleAction: exampleActionText,
        reason: reasonText,
        probability: `≈ ${(bandData.probability * 100).toFixed(0)}%`,
        rangeDisplay: rangeDisplayVal,
        colorConfig: colorConfig,
    };
}).sort((a, b) => {
    // Ensure sorting uses the BandName type for consistency
    const order = ["EXTREME", "DEEP", "OPPORTUNE", "NEUTRAL", "RICH"];
    return order.indexOf(a.name) - order.indexOf(b.name);
});
export const classifyRateToBand = (rate) => {
    if (rate === null || rate === undefined || isNaN(rate))
        return null;
    for (const band of BANDS) {
        if (band.condition(rate)) {
            return band;
        }
    }
    console.warn(`Rate ${rate} could not be classified into any band. Check BANDS definitions.`);
    return null;
};
export { fullAnalysisData as FULL_ANALYSIS_DATA };
export const DEFAULT_ALERT_PREFS = {
    EXTREME: true,
    DEEP: true,
    OPPORTUNE: true,
    NEUTRAL: true,
    RICH: true, // Default for 'RICH'
};
