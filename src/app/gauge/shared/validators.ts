import { GaugeProps } from './gauge.interface';

const showError = (text: string) => {
  console.error(`GaugeComponent: ${text}`);
}

export const validate = (props: GaugeProps): boolean => {
  if (props.max) {
    console.error('The maximal value is not set.');
  }
  if (!(0 <= props.start && props.start <= 359) || !(0 <= props.end && props.end <= 359)) {
    console.error('The end and start must be between 0 and 359 degrees.');
  }
  return true;
};

