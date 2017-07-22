import { GaugeProps, Sector } from './gauge.interface';

const showError = (text: string) => {
  console.error(`GaugeComponent: ${text}`);
};

export const validate = (props: GaugeProps) => {
  if (props.max) {
    showError('The maximal value is not set.');
  }

  if (!(0 <= props.start && props.start <= 359) || !(0 <= props.end && props.end <= 359)) {
    showError('The end and start must be between 0 and 359 degrees.');
  }

  if (props.light && props.light > props.max) {
    showError('The red light trigger value cannot be greater than the max value of the gauge.');
  }

  if (props.factor && props.factor >= props.max) {
    showError('The factor cannot be greater than or equal to the max value.');
  }

  if (props.sectors) {
    props.sectors.forEach((s: Sector) => {
      if (s.from > props.max || s.to > props.max) {
        showError('The sector bounds cannot be greater than the max value.');
      }

      if (s.from >= s.to) {
        showError('The lower bound of the sector cannot be greater than or equal to the upper one.');
      }

      if (!s.color) {
        showError(`Sector[${s.from}, ${s.to}] color is empty.`);
      }
    });
  }
};
