import React from 'react';
import HcBase, { HcBaseProps } from './HcBase';

export interface HcLineProps extends Omit<HcBaseProps, 'options'> {
  data: Array<{
    name: string;
    data: Array<[string | number, number]> | Array<number>;
    color?: string;
  }>;
  xAxisTitle?: string;
  yAxisTitle?: string;
  title?: string;
  subtitle?: string;
  categories?: string[];
}

const HcLine: React.FC<HcLineProps> = ({
  data,
  xAxisTitle,
  yAxisTitle,
  title,
  subtitle,
  categories,
  ...baseProps
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: 'line'
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
    series: data.map(item => ({
      type: 'line',
      name: item.name,
      data: item.data,
      color: item.color
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

export default HcLine;