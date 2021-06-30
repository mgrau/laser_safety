import React from "react";
import MathJax from "react-mathjax";

import Typography from "@material-ui/core/Typography";

import { MODE, maxSafeIntensity } from "./safety";
import { unit } from "mathjs";

const ModeLongForm = {
  [MODE.ContinuousWave]: "CW",
  [MODE.Pulsed]: "long pulsed",
  [MODE.GiantPulsed]: "pulsed",
  [MODE.Modelocked]: "mode-locked pulsed"
};

interface ExplanationProps {
  pulsed: boolean;
  mode: MODE;
  wavelength: number;
  LB: number;
}

export default function Explanation(props: ExplanationProps) {
  const intensity = props.pulsed ? "fluence" : "intensity";

  return (
    <MathJax.Provider>
      <Typography component="div">
        The laser {intensity} for a {props.pulsed ? "pulsed" : "continous wave"}{" "}
        laser is calculated assuming a Gaussian beam profile,
        <MathJax.Node
          formula={`I = \\frac{2 P}{\\pi w^2} = \\frac{8 P}{\\pi d^2},`}
        />
        where <MathJax.Node inline formula={"P"} /> is the{" "}
        {props.pulsed ? "energy" : "power"}
        , and <MathJax.Node inline formula={"d = 2w"} /> is the{" "}
        <MathJax.Node inline formula={"1/e^2"} /> diameter.This value for{" "}
        <MathJax.Node inline formula={"d"} /> should be the diameter that might
        reasonably enter your eye. This value should be compared to the maximum
        safe {intensity} <MathJax.Node inline formula={"I_\\text{safe}"} /> as
        specified by <a href="https://en.wikipedia.org/wiki/EN_207">EN 207:2017</a>. For a {ModeLongForm[props.mode]} laser with
        wavelength of {props.wavelength} nm, this is{" "}
        {maxSafeIntensity(unit(props.wavelength, "nm"), props.mode) == null
          ? "?"
          : maxSafeIntensity(unit(props.wavelength, "nm"), props.mode).toNumber(
            props.pulsed ? "J/m^2" : "W/m^2"
          )}{" "}
        {props.pulsed ? "J/m²" : "W/m²"}
        . The optical density (
        <MathJax.Node inline formula={"\\text{OD}"} />) required to attenuate
        the laser {intensity} to the maximum safe {intensity} can be calculated
        according to
        <MathJax.Node
          formula={`\\text{OD} = \\text{log}_{10}\\left(\\frac{I}{I_\\text{safe}}\\right).`}
        />
        Finally, the laser goggle scale number LB also requires that the filter
        not break or melt, and also specifies the type of laser. In this case,
        for a {ModeLongForm[props.mode]} laser, this is{" "}
        <b>{props.LB == null ? "?" : `${props.mode} LB${props.LB}`}</b>
      </Typography>
    </MathJax.Provider>
  );
}
