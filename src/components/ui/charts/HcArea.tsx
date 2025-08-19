import React from 'react';
import HcBase, { HcBaseProps } from './HcBase';

export interface HcAreaProps extends Omit<HcBaseProps, 'options'> {
  data: Array<{
    name: string;
    data: Array<[string | number, number]> | Array<number>;
    color?: string;
    fillOpacity?: number;
  }>;
  xAxisTitle?: string;
  yAxisTitle?: string;
  title?: string;
  subtitle?: string;
  categories?: string[];
  stacked?: boolean;
}

const HcArea: React.FC<HcAreaProps> = ({
  data,
  xAxisTitle,
  yAxisTitle,
  title,
  subtitle,
  categories,
  stacked = false,
  ...baseProps
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'area'
    },
    title: {
      text: title || null
    },
    subtitle: {
      text: subtitle || null
    },
    xAxis: {
      title: {
        text: xAxisTitle
      },
      categories: categories
    },
    yAxis: {
      title: {
        text: yAxisTitle
      }
    },
    plotOptions: {
      area: {
        stacking: stacked ? 'normal' : undefined,
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      }
    },
    series: data.map(item => ({
      type: 'area',
      name: item.name,
      data: item.data,
      color: item.color,
      fillOpacity: item.fillOpacity || 0.1
    })),
    responsive: {
      rules: [{
        condition: {
          maxWidth: 500
        },
        chartOptions: {
          legend: {
            enabled: false
          }
        }
      }]
    }
  };

  return <HcBase options={options} {...baseProps} />;
};

export default HcArea;