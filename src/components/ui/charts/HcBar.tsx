import React from 'react';
import HcBase, { HcBaseProps } from './HcBase';

export interface HcBarProps extends Omit<HcBaseProps, 'options'> {
  data: Array<{
    name: string;
    data: Array<number>;
    color?: string;
  }>;
  categories: string[];
  xAxisTitle?: string;
  yAxisTitle?: string;
  title?: string;
  subtitle?: string;
  horizontal?: boolean;
  stacked?: boolean;
}

const HcBar: React.FC<HcBarProps> = ({
  data,
  categories,
  xAxisTitle,
  yAxisTitle,
  title,
  subtitle,
  horizontal = false,
  stacked = false,
  ...baseProps
}) => {
  const options: Highcharts.Options = {
    chart: {
      type: horizontal ? 'bar' : 'column'
    },
    title: {
      text: title || null
    },
    subtitle: {
      text: subtitle || null
    },
    xAxis: {
      categories: categories,
      title: {
        text: xAxisTitle
      }
    },
    yAxis: {
      title: {
        text: yAxisTitle
      }
    },
    plotOptions: {
      series: {
        stacking: stacked ? 'normal' : undefined
      }
    },
    series: data.map(item => ({
      type: horizontal ? 'bar' : 'column',
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

export default HcBar;