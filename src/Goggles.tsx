import React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import Collapse from "@material-ui/core/Collapse";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import goggles from "./goggles.json";
// @ts-ignore
import images from "../img/*.png";

const useStyles = makeStyles(theme => ({
  card: {
    marginBottom: theme.spacing(2)
  },
  image: {
    padding: theme.spacing(4)
  },
  expand: {
    transform: "rotate(0deg)",
    marginLeft: "auto",
    transition: theme.transitions.create("transform", {
      duration: theme.transitions.duration.shortest
    })
  },
  expandOpen: {
    transform: "rotate(180deg)"
  }
}));

export default function Goggles(props) {
  const Goggles = goggles
    .filter(goggle => {
      return (
        goggle.wavelengths.find(wavelength => {
          return (
            wavelength.start <= props.wavelength &&
            props.wavelength <= wavelength.end &&
            wavelength.rating[props.mode] >= props.LB
          );
        }) != undefined
      );
    })
    .map((goggle, index) => <Goggle key={index} {...goggle} />);
  return <div>{Goggles}</div>;
}

function Goggle(props) {
  const classes = useStyles(props);
  const [expanded, setExpanded] = React.useState(false);

  const ratingString = rating =>
    Object.entries(
      Object.keys(rating).reduce(
        (r, mode) => ({
          ...r,
          [rating[mode]]: (r[rating[mode]] || "").concat(mode)
        }),
        {}
      )
    )
      .map(rating => rating[1] + " LB" + rating[0])
      .join(" + ");

  return (
    <Card className={classes.card}>
      <CardActionArea>
        <CardMedia
          className={classes.image}
          component="img"
          alt={`${props.name} laser goggle`}
          image={images[props.image]}
          title={props.name}
        />
        <CardContent>
          <CardActions disableSpacing onClick={() => setExpanded(!expanded)}>
            <Typography variant="h6" component="h3">
              {props.name}
            </Typography>
            <Typography
              className={clsx(classes.expand, {
                [classes.expandOpen]: expanded
              })}
              aria-expanded={expanded}
              aria-label="show ratings"
            >
              <ExpandMoreIcon />
            </Typography>
          </CardActions>
          <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell align="left">Wavelength</TableCell>
                  <TableCell align="right">Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {props.wavelengths.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="left" size="medium" padding="none">
                      {row.start}-{row.end} nm
                    </TableCell>
                    <TableCell align="right" size="small" padding="none">
                      {ratingString(row.rating)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Collapse>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
