## v1.3.0 (Jan 2023)

### Fixes and/or improvements

- Gauge input is now limited by the max value
- Improved validation
- Changed component input names to better and more descriptive ones (see **Breaking changes**)
- `max` and `value` are now required
- Fixed issue #5
- Other smaller improvements
- Project upgraded to Angular 17
- Integrated with GitHub Actions

### Breaking changes

- Component name is now reverted back to `ng2-gauge`
- The main module name is now reverted back to `GaugeModule`
- Some component input names were updated as follow:
  - `input` to `value`
  - `start` to `arcStart`
  - `end` to `arcEnd`
  - `showDigital` to `digitalDisplay`
  - `lightTheme` to `darkTheme` (a mistake in the initial release)
  - `light` to `activateRedLightAfter`
- `factor` input is no longer supported

## v1.2.0 (Dec 2018)

### Fixes and/or improvements

- Upgrade to Angular 7
- Use `angular-cli` projects feature for maintaining the library. Optimized & smaller build

### Breaking changes

- Module name changed from `GaugeModule` to `Ng2GaugeModule`
- Component name changed from `ng2-gauge` to `nga-ng2-gauge` due to project prefixing in `angular-cli`

## v1.1.7 (Mar 2018)

### Fixes and/or improvements

- Fix support of the `config` input - Credits: [@mehrjouei](https://github.com/mehrjouei)
- Fix arrow position - Credits: [@mehrjouei](https://github.com/mehrjouei)
- Introduce dynamic `max` - Credits: [@leticiafatimaa](https://github.com/leticiafatimaa)
- Introduce `size` property for changing the width/size

### Breaking changes

No breaking changes
