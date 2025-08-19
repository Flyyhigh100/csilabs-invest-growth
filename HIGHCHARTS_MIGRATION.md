# Highcharts Migration Guide

## Overview
This project supports both Recharts and Highcharts chart engines with a feature flag system. Highcharts provides professional-grade charts with advanced features, animations, and customization options.

## Current Status
✅ **Implemented:**
- Highcharts dependencies and modules installed
- Professional theme with design system integration
- Feature flag system (`VITE_CHARTS_ENGINE`)
- Base chart components (HcLine, HcArea, HcBar, HcPie)
- Dark/light theme support
- ChartEngineProvider context
- Pilot conversion: TokenCharts (HomePage)

🚧 **In Progress:**
- Admin dashboard chart conversions
- Advanced chart types (funnel, gauges, etc.)
- Complete feature parity with Recharts

📋 **Pending:**
- Performance optimization
- Accessibility enhancements
- Export functionality
- Production license compliance

## Feature Flag Configuration

### Environment Variables
```bash
# Use Highcharts (recommended for production)
VITE_CHARTS_ENGINE="highcharts"

# Use Recharts (fallback/legacy)
VITE_CHARTS_ENGINE="recharts"
```

### Switching Chart Engines
1. Update `.env` file with desired chart engine
2. Restart development server
3. All charts will automatically use the specified engine

## Chart Components

### Available Highcharts Components
- `HcBase` - Base chart component with loading/error states
- `HcLine` - Line charts for trends and time series
- `HcArea` - Area charts with fill options
- `HcBar` - Column/bar charts with horizontal/vertical options
- `HcPie` - Pie and donut charts

### Usage Example
```tsx
import { HcLine } from '@/components/ui/charts';
import { useChartEngine } from '@/lib/charts/ChartEngineProvider';

const MyChart = ({ data }) => {
  const { isHighcharts } = useChartEngine();
  
  if (isHighcharts) {
    return (
      <HcLine
        data={[{
          name: 'Series 1',
          data: data.map(item => [item.date, item.value]),
          color: 'hsl(var(--primary))'
        }]}
        title="My Chart"
        yAxisTitle="Value"
        height={300}
      />
    );
  }
  
  // Fallback to Recharts
  return <RechartsComponent data={data} />;
};
```

## Design System Integration

### Theme Colors
Charts automatically use CSS custom properties:
- `hsl(var(--primary))` - Primary brand color
- `hsl(var(--secondary))` - Secondary accent color
- `hsl(var(--background))` - Background color
- `hsl(var(--foreground))` - Text color
- `hsl(var(--border))` - Border and grid colors

### Dark Mode Support
Charts automatically adapt to light/dark theme changes through the ThemeProvider.

## Migration Checklist

### Per Chart Component:
- [ ] Add feature flag check (`useChartEngine`)
- [ ] Implement Highcharts version with proper data transformation
- [ ] Maintain Recharts fallback
- [ ] Test loading and error states
- [ ] Verify responsive behavior
- [ ] Ensure accessibility

### Completed Migrations:
- [x] TokenCharts (PriceChart, VolumeChart)

### Pending Migrations:
- [ ] FinancialCharts
- [ ] UserEngagementCharts
- [ ] TransactionCharts
- [ ] ConversionFunnelChart
- [ ] PredictiveAnalyticsChart
- [ ] GeographicAnalyticsChart
- [ ] RealTimeDashboardChart
- [ ] And others...

## Rollback Plan

### Immediate Rollback:
1. Set `VITE_CHARTS_ENGINE="recharts"` in `.env`
2. Restart application
3. All charts revert to Recharts

### Full Rollback:
1. Remove Highcharts dependencies
2. Remove Highcharts-related files
3. Clean up feature flag code
4. Restore original chart components

## Licensing Requirements

### Development/Staging:
- Non-commercial use is allowed for evaluation
- Current implementation includes evaluation notice

### Production:
- **Required:** Purchase Highcharts Commercial License
- **Needed:** Highcharts Core + optionally Highcharts Stock
- **Contact:** Highcharts Sales for enterprise license
- **Remove:** All evaluation notices before production deployment

## Performance Considerations

### Bundle Size:
- Highcharts: ~500KB (tree-shakeable)
- Recharts: ~400KB
- Feature flag allows switching without code changes

### Runtime Performance:
- Highcharts: Better for large datasets and complex interactions
- Recharts: Lighter for simple charts

## Troubleshooting

### Common Issues:

1. **TypeScript Errors:**
   - Ensure proper data type annotations
   - Check Highcharts option types

2. **Theme Not Applied:**
   - Verify ChartEngineProvider is above component tree
   - Check CSS custom properties are defined

3. **Charts Not Rendering:**
   - Verify Highcharts modules are imported
   - Check console for JavaScript errors
   - Ensure container has defined height

### Debug Mode:
```bash
# Enable debug logging
VITE_DEBUG_CHARTS="true"
```

## Next Steps

1. **Phase 1:** Complete admin dashboard chart migrations
2. **Phase 2:** Add advanced chart features (export, annotations)
3. **Phase 3:** Performance optimization and accessibility
4. **Phase 4:** Production license compliance and deployment