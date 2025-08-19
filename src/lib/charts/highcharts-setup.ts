import Highcharts from 'highcharts';

// For now, let's use just the core Highcharts without additional modules
// to avoid the module loading issues. We can add modules later if needed.

// Professional theme configuration
const professionalTheme: Highcharts.Options = {
  colors: [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    'hsl(var(--muted))',
    '#00C49F',
    '#FFBB28',
    '#FF8042',
    '#A569BD',
    '#EC7063'
  ],
  chart: {
    backgroundColor: 'hsl(var(--background))',
    style: {
      fontFamily: 'var(--font-sans)',
      color: 'hsl(var(--foreground))'
    },
    plotBorderColor: 'hsl(var(--border))',
    plotBorderWidth: 0,
    spacing: [20, 20, 20, 20]
  },
  title: {
    style: {
      color: 'hsl(var(--foreground))',
      fontWeight: '600',
      fontSize: '18px'
    }
  },
  subtitle: {
    style: {
      color: 'hsl(var(--muted-foreground))',
      fontSize: '14px'
    }
  },
  xAxis: {
    gridLineColor: 'hsl(var(--border))',
    lineColor: 'hsl(var(--border))',
    tickColor: 'hsl(var(--border))',
    labels: {
      style: {
        color: 'hsl(var(--muted-foreground))',
        fontSize: '12px'
      }
    },
    title: {
      style: {
        color: 'hsl(var(--foreground))',
        fontSize: '12px'
      }
    }
  },
  yAxis: {
    gridLineColor: 'hsl(var(--border))',
    lineColor: 'hsl(var(--border))',
    tickColor: 'hsl(var(--border))',
    labels: {
      style: {
        color: 'hsl(var(--muted-foreground))',
        fontSize: '12px'
      }
    },
    title: {
      style: {
        color: 'hsl(var(--foreground))',
        fontSize: '12px'
      }
    }
  },
  legend: {
    itemStyle: {
      color: 'hsl(var(--foreground))',
      fontSize: '12px'
    },
    itemHoverStyle: {
      color: 'hsl(var(--primary))'
    }
  },
  tooltip: {
    backgroundColor: 'hsl(var(--popover))',
    borderColor: 'hsl(var(--border))',
    style: {
      color: 'hsl(var(--popover-foreground))',
      fontSize: '12px'
    }
  },
  plotOptions: {
    series: {
      animation: {
        duration: 750,
        easing: 'easeOutQuart'
      },
      marker: {
        radius: 4
      }
    },
    line: {
      lineWidth: 2,
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: true,
            radius: 6
          }
        }
      }
    },
    area: {
      fillOpacity: 0.1,
      lineWidth: 2,
      marker: {
        enabled: false,
        states: {
          hover: {
            enabled: true,
            radius: 6
          }
        }
      }
    },
    column: {
      borderRadius: 4,
      borderWidth: 0
    },
    bar: {
      borderRadius: 4,
      borderWidth: 0
    },
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      dataLabels: {
        enabled: true,
        style: {
          color: 'hsl(var(--foreground))',
          fontSize: '12px'
        }
      },
      showInLegend: true
    }
  },
  credits: {
    enabled: false
  }
};

// Apply the theme
Highcharts.setOptions(professionalTheme);

// Dark mode detection and theme switching
export const updateHighchartsTheme = (isDark: boolean) => {
  const themeColors = isDark ? {
    backgroundColor: 'hsl(var(--background))',
    foregroundColor: 'hsl(var(--foreground))',
    mutedForegroundColor: 'hsl(var(--muted-foreground))',
    borderColor: 'hsl(var(--border))',
    popoverColor: 'hsl(var(--popover))',
    popoverForegroundColor: 'hsl(var(--popover-foreground))'
  } : {
    backgroundColor: 'hsl(var(--background))',
    foregroundColor: 'hsl(var(--foreground))',
    mutedForegroundColor: 'hsl(var(--muted-foreground))',
    borderColor: 'hsl(var(--border))',
    popoverColor: 'hsl(var(--popover))',
    popoverForegroundColor: 'hsl(var(--popover-foreground))'
  };

  Highcharts.setOptions({
    chart: {
      backgroundColor: themeColors.backgroundColor,
      style: {
        color: themeColors.foregroundColor
      }
    },
    xAxis: {
      gridLineColor: themeColors.borderColor,
      lineColor: themeColors.borderColor,
      tickColor: themeColors.borderColor,
      labels: {
        style: {
          color: themeColors.mutedForegroundColor
        }
      }
    },
    yAxis: {
      gridLineColor: themeColors.borderColor,
      lineColor: themeColors.borderColor,
      tickColor: themeColors.borderColor,
      labels: {
        style: {
          color: themeColors.mutedForegroundColor
        }
      }
    }
  });
};

export { Highcharts };
export default Highcharts;