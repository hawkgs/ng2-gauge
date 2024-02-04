import { GaugeProps, Sector } from './interfaces';

const error = (text: string, throwErr?: boolean) => {
  const msg = `GaugeComponent: ${text}`;

  if (throwErr) {
    throw new Error(msg);
  }
  console.error(msg);
};

export const validate = (props: GaugeProps) => {
  if (!props.max) {
    error('Missing "max" input property', true);
  }

  if (
    !(0 <= props.arcStart && props.arcStart <= 359) ||
    !(0 <= props.arcEnd && props.arcEnd <= 359)
  ) {
    error(
      'The scale arc end and start must be between 0 and 359 degrees.',
      true,
    );
  }

  if (props.activateRedLightAfter && props.activateRedLightAfter > props.max) {
    error(
      'The red light trigger value cannot be greater than the max value of the gauge.',
    );
  }

  // if (props.scaleFactor && props.scaleFactor >= props.max) {
  //   showError('The factor cannot be greater than or equal to the max value.');
  // }

  if (props.sectors) {
    props.sectors.forEach((s: Sector) => {
      if (s.from < -1 || s.to < -1) {
        error('The sector bounds cannot be negative.', true);
      }

      if (s.from > props.max || s.to > props.max) {
        error('The sector bounds cannot be greater than the max value.', true);
      }

      if (s.from >= s.to) {
        error(
          'The lower bound of the sector cannot be greater than or equal to the upper one.',
          true,
        );
      }

      if (!s.color) {
        error(`Sector[${s.from}, ${s.to}] color is empty.`);
      }
    });
  }
};
