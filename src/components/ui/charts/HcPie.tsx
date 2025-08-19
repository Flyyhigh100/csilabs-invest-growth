import React from 'react';
import HcBase, { HcBaseProps } from './HcBase';

export interface HcPieProps extends Omit<HcBaseProps, 'options'> {
  data: Array<{
    name: string;
    y: number;
    color?: string;
  }>;
  title?: string;
  subtitle?: string;
  innerSize?: number; // For donut charts
  showDataLabels?: boolean;
  showLegend?: boolean;
}

const HcPie: React.FC<HcPieProps> = ({
  data,
  title,
  subtitle,
  innerSize = 0,
  showDataLabels = true,
  showLegend = true,
  ...baseProps
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'pie'
    },
    title: {
      text: title || null
    },
    subtitle: {
      text: subtitle || null
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: showDataLabels,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%'
        },
        showInLegend: showLegend,
        innerSize: innerSize > 0 ? `${innerSize}%` : undefined
      }
    },
    series: [{
      type: 'pie',
      name: 'Values',
      data: data
    }],
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          plotOptions: {
            pie: {
              dataLabels: {
                enabled: false
              }
            }
          },
          legend: {
            enabled: true,
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'bottom'
          }
        }
      }]
    }
  };

  return <HcBase options={options} {...baseProps} />;
};

export default HcPie;