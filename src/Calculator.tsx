import React from "react";
import queryString from "query-string";

import { makeStyles } from "@material-ui/core/styles";
import CssBaseline from "@material-ui/core/CssBaseline";
import Container from "@material-ui/core/Container";
import Grid from "@material-ui/core/Grid";

import Paper from "@material-ui/core/Paper";
import Typography from "@material-ui/core/Typography";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import Link from "@material-ui/core/Link";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { unit } from "mathjs";
import { MODE, minLB, maxPower } from "./safety";
import Explanation from "./Explanation";
import Goggles from "./Goggles";

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(4, 3),
    marginTop: theme.spacing(5),
    display: "flex",
    flexWrap: "wrap"
  },
  margin: {
    marginBottom: theme.spacing(3)
  }
}));

export default function Calculator(props: {}) {
  const classes = useStyles(props);

  const url = queryString.parse(location.search);
  const init = {
    mode: url.mode == undefined ? MODE.ContinuousWave : (url.mode as MODE),
    wavelength:
      url.wavelength == undefined || parseInt(url.wavelength as string) < 0
        ? 1064
        : parseInt(url.wavelength as string),
    power:
      url.power == undefined || parseInt(url.power as string) < 0
        ? 100
        : parseInt(url.power as string),
    diameter:
      url.diameter == undefined || parseInt(url.diameter as string) < 0
        ? 1
        : parseInt(url.diameter as string)
  };

  const pulsed = (mode: MODE, wavelength: number) => {
    return (
      mode == MODE.GiantPulsed ||
      mode == MODE.Pulsed ||
      (mode == MODE.Modelocked && 315 <= wavelength && wavelength < 1400)
    );
  };

  const powerUnit = (mode: MODE, wavelength: number) => {
    return pulsed(mode, wavelength) ? "mJ" : "mW";
  };

  const calculateIntensity = (
    mode: MODE,
    wavelength: number,
    power: number,
    diameter: number
  ): math.Unit => {
    const pUnit = powerUnit(mode, wavelength);
    return unit(
      ((8 / Math.PI) * power) / Math.pow(diameter, 2),
      pUnit + "/mm^2"
    );
  };

  const [values, setValues] = React.useState({
    mode: init.mode,
    wavelength: init.wavelength,
    power: init.power,
    diameter: init.diameter,
    LB: minLB(
      unit(init.wavelength, "nm"),
      calculateIntensity(init.mode, init.wavelength, init.power, init.diameter),
      init.mode
    )
  });

  const setMode = (mode: MODE) => {
    const intensity = calculateIntensity(
      mode,
      values.wavelength,
      values.power,
      values.diameter
    );
    const LB = minLB(unit(values.wavelength, "nm"), intensity, mode);
    setValues({ ...values, mode: mode, LB: LB });
  };

  const setWavelength = (rawWavelength: number) => {
    if (!isNaN(rawWavelength)) {
      const wavelength = Math.max(0, rawWavelength);
      const intensity = calculateIntensity(
        values.mode,
        wavelength,
        values.power,
        values.diameter
      );
      const LB = minLB(unit(wavelength, "nm"), intensity, values.mode);
      setValues({ ...values, wavelength: wavelength, LB: LB });
    } else {
      setValues({ ...values, wavelength: -1 });
    }
  };

  const setPower = (rawPower: number) => {
    if (!isNaN(rawPower)) {
      const power = Math.max(0, rawPower);
      const intensity = calculateIntensity(
        values.mode,
        values.wavelength,
        power,
        values.diameter
      );
      const LB = minLB(unit(values.wavelength, "nm"), intensity, values.mode);
      setValues({ ...values, power: power, LB: LB });
    } else {
      setValues({ ...values, power: -1 });
    }
  };

  const setDiameter = (rawDiameter: number) => {
    if (!isNaN(rawDiameter)) {
      const diameter = Math.max(0, rawDiameter);
      const intensity = calculateIntensity(
        values.mode,
        values.wavelength,
        values.power,
        diameter
      );
      if (isFinite(parseFloat(intensity.toString()))) {
        const LB = minLB(unit(values.wavelength, "nm"), intensity, values.mode);
        setValues({ ...values, diameter: diameter, LB: LB });
      } else {
        setValues({ ...values, diameter: diameter });
      }
    } else {
      setValues({ ...values, diameter: -1 });
    }
  };

  const setLB = (rawLB: number) => {
    if (!isNaN(rawLB)) {
      const LB = Math.max(0, rawLB);
      const rawPower = maxPower(
        unit(values.wavelength, "nm"),
        LB,
        unit(values.diameter, "mm"),
        values.mode
      ).toNumber(powerUnit(values.mode, values.wavelength));
      const power = Number(rawPower.toPrecision(2));
      setValues({ ...values, power: power, LB: LB });
    } else {
      setValues({ ...values, LB: null });
    }
  };

  return (
    <div>
      <CssBaseline />
      <Container maxWidth="xs">
        <Paper className={classes.root}>
          <Grid container spacing={2}>
            <Grid item xs={12} className={classes.margin}>
              <Typography variant="h5" component="h3">
                Laser Goggle Calculator
              </Typography>
              <Typography component="p">
                This calculates recommended laser safety eyewear ratings for
                common lab scenarios according to the EN 207 standard.
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Button
                fullWidth
                color="primary"
                variant={
                  values.mode == MODE.ContinuousWave ? "contained" : "outlined"
                }
                onClick={() => setMode(MODE.ContinuousWave)}
              >
                CW
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                color="primary"
                variant={
                  values.mode == MODE.Modelocked ? "contained" : "outlined"
                }
                onClick={() => setMode(MODE.Modelocked)}
              >
                Mode Locked
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                color="primary"
                variant={values.mode == MODE.Pulsed ? "contained" : "outlined"}
                onClick={() => setMode(MODE.Pulsed)}
              >
                Long Pulse
              </Button>
            </Grid>
            <Grid item xs={6} className={classes.margin}>
              <Button
                fullWidth
                color="primary"
                variant={
                  values.mode == MODE.GiantPulsed ? "contained" : "outlined"
                }
                onClick={() => setMode(MODE.GiantPulsed)}
              >
                Pulsed
              </Button>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                label="Wavelength"
                type="number"
                value={values.wavelength < 0 ? "" : values.wavelength}
                onChange={event =>
                  setWavelength(parseFloat(event.target.value))
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">nm</InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Power"
                type="number"
                value={values.power < 0 ? "" : values.power}
                onChange={event => setPower(parseFloat(event.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {powerUnit(values.mode, values.wavelength)}
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Diameter"
                type="number"
                value={values.diameter < 0 ? "" : values.diameter}
                onChange={event => setDiameter(parseFloat(event.target.value))}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">mm</InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Optical Density"
                type="number"
                value={values.LB == null ? "" : values.LB}
                onChange={event => setLB(parseFloat(event.target.value))}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="end">OD</InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                variant="outlined"
                label="Goggle Rating"
                value={values.LB == null ? "" : `${values.mode} LB${values.LB}`}
                InputProps={{
                  readOnly: true
                }}
              />
            </Grid>

            <Grid item xs={12}>
              Share{" "}
              <Link
                href={
                  queryString.parseUrl(document.location.href).url +
                  "?" +
                  queryString.stringify({
                    mode: values.mode,
                    wavelength: values.wavelength,
                    power: values.power,
                    diameter: values.diameter
                  })
                }
              >
                Link to Calculation
              </Link>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Explanation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Explanation
                    pulsed={pulsed(values.mode, values.wavelength)}
                    mode={values.mode}
                    wavelength={values.wavelength}
                    LB={values.LB}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12}>
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="panel1a-content"
                  id="panel1a-header"
                >
                  <Typography>Recommended Goggles</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Goggles
                    wavelength={values.wavelength}
                    mode={values.mode}
                    LB={values.LB}
                  />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </div>
  );
}
