import {
  unit,
  log10,
  ceil,
  max,
  multiply,
  divide,
  pow,
  sqrt,
  smaller,
  smallerEq,
  pi
} from "mathjs";

export enum MODE {
  ContinuousWave = "D",
  Pulsed = "I",
  GiantPulsed = "R",
  Modelocked = "M"
}

// Provides the maximum safe intensity as defined by EN207:2017, for a given wavelength and laser working mode.
// Returns a value in SI units, either a maximum intensity in units of W/m^2, or a maximum fluence in J/m^2
// for wavelengths out of range (<315nm, >1000um),
export function maxSafeIntensity(wavelength: math.Unit, mode: MODE): math.Unit {
  if (
    smaller(unit("180 nm"), wavelength) &&
    smallerEq(wavelength, unit("315 nm"))
  ) {
    if (mode == MODE.ContinuousWave) {
      return unit(1e-3, "W/m^2");
    } else if (mode == MODE.Pulsed || mode == MODE.GiantPulsed) {
      return unit(3e1, "J/m^2");
    } else if (mode == MODE.Modelocked) {
      return unit(3e10, "W/m^2");
    }
  } else if (
    smaller(unit("315 nm"), wavelength) &&
    smallerEq(wavelength, unit("1400 nm"))
  ) {
    if (mode == MODE.ContinuousWave) {
      return unit(1e1, "W/m^2");
    } else if (mode == MODE.Pulsed || mode == MODE.GiantPulsed) {
      return unit(5e-3, "J/m^2");
    } else if (mode == MODE.Modelocked) {
      return unit(1.5e-4, "J/m^2");
    }
  } else if (
    smaller(unit("1400 nm"), wavelength) &&
    smallerEq(wavelength, unit("1000 um"))
  ) {
    if (mode == MODE.ContinuousWave) {
      return unit(1e3, "W/m^2");
    } else if (mode == MODE.Pulsed || mode == MODE.GiantPulsed) {
      return unit(1e2, "J/m^2");
    } else if (mode == MODE.Modelocked) {
      return unit(1e11, "W/m^2");
    }
  } else {
    return null;
  }
}

export function minLB(
  wavelength: math.Unit,
  intensity: math.Unit,
  mode: MODE
): number {
  const max_safe_intensity = maxSafeIntensity(wavelength, mode);
  if (max_safe_intensity == null) {
    return null;
  }
  const relative_intensity = divide(intensity, max_safe_intensity);
  return max(0, ceil(log10(parseFloat(relative_intensity.toString()))));
}

export function maxIntensity(
  wavelength: math.Unit,
  LB: number,
  mode: MODE
): math.Unit {
  const max_safe_intensity = maxSafeIntensity(wavelength, mode);
  return multiply(pow(10, LB), max_safe_intensity) as math.Unit;
}

export function maxPower(
  wavelength: math.Unit,
  LB: number,
  diameter: math.Unit,
  mode: MODE
): math.Unit {
  const max_intensity = maxIntensity(wavelength, LB, mode);
  return multiply(
    pi / 8,
    multiply(pow(diameter, 2), max_intensity)
  ) as math.Unit;
}

export function minDiameter(
  wavelength: math.Unit,
  LB: number,
  power: math.Unit,
  mode: MODE
): math.Unit {
  const max_intensity = maxIntensity(wavelength, LB, mode);
  return sqrt(divide(multiply(8 / pi, power) as math.Unit, max_intensity));
}
