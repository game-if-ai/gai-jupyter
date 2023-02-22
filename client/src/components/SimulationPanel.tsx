/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useEffect, useRef, useState } from "react";
import { Button, IconButton, Paper, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { PlayCircleOutline, PauseCircleOutline, NavigateBefore, NavigateNext } from "@mui/icons-material";
import makeStyles from "@mui/styles/makeStyles";

import { Classifier, ClassifierInput, ClassifierOutput } from "../classifier";
import { SimulationOutput, Simulator } from "../simulator";
import { EventSystem } from "../event-system";
import { FruitSimulationOutput } from "../games/fruit-picker/simulator";

const SPEEDS = [1, 2, 4, 10];

function Summary(props: { simulation: SimulationOutput }): JSX.Element {
    const simulation = props.simulation as FruitSimulationOutput;
    return (
        <TableContainer component={Paper}>
            <TableHead>
                <TableRow>
                    <TableCell align="right">Score</TableCell>
                    <TableCell align="right">Accuracy</TableCell>
                    <TableCell align="right">Label</TableCell>
                    <TableCell align="right">Match Label</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                <TableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell align="center">{simulation.score}</TableCell>
                    <TableCell align="center">{simulation.accuracy * 100}%</TableCell>
                    <TableCell align="center">{simulation.label}</TableCell>
                    <TableCell align="center">{simulation.matchLabel}</TableCell>
                </TableRow>
            </TableBody>
        </TableContainer>
    )
}

function GamePlayer(props: {
    game: Phaser.Types.Core.GameConfig,
    simulator: Simulator<SimulationOutput, Classifier<ClassifierInput, ClassifierOutput>>,
    simulations: SimulationOutput[],
    simulation: number,
    toNotebook: () => void,
    toSummary: () => void,
}): JSX.Element {
    const classes = useStyles();
    const [game, setGame] = useState<Phaser.Game>();
    const [simulation, setSimulation] = useState<number>(props.simulation);
    const [speed, setSpeed] = useState<number>(1);
    const [isPaused, setIsPaused] = useState<boolean>(false);
    const [showSummary, setShowSummary] = useState<boolean>(false);

    const { simulations } = props;
    const gameContainerElement = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (game) {
            return;
        }
        EventSystem.on("gameOver", endSimulation);
        setGame(new Phaser.Game({
            ...props.game,
            parent: gameContainerElement.current as HTMLElement,
        }));
    }, [gameContainerElement]);

    useEffect(() => {
        if (!game) {
            return;
        }
        game.scene.start("MainGame", {
            playManually: false,
            simulator: props.simulator,
            simulation: simulations[simulation],
        });
    }, [game, simulation]);

    function toNotebook(): void {
        pause(true);
        props.toNotebook();
    }

    function toSummary(): void {
        pause(true);
        props.toSummary();
    }

    function toSimulation(i: number): void {
        pause(false);
        setShowSummary(false);
        setSimulation(i);
    }

    function endSimulation(): void {
        pause(true);
        setShowSummary(true);
    }

    function pause(paused: boolean): void {
        if (!game) {
            return;
        }
        setIsPaused(paused);
        EventSystem.emit("pause", paused);
    }

    function changeSpeed(speed: number): void {
        setSpeed(speed);
        EventSystem.emit("changeSpeed", speed)
    }

    return (
        <div>
            <div className={classes.controls}>
                <Button className={classes.button} onClick={toNotebook}>
                    Notebook
                </Button>
                <Button disabled={simulation === 0} onClick={() => toSimulation(0)}>
                    1
                </Button>
                <Typography>
                    ...
                </Typography>
                <Button disabled={simulation === 0} onClick={() => toSimulation(simulation - 1)}>
                    <NavigateBefore />
                </Button>
                <Typography>
                    {simulation + 1}
                </Typography>
                <Button disabled={simulation === simulations.length - 1} onClick={() => toSimulation(simulation + 1)}>
                    <NavigateNext />
                </Button>
                <Typography>
                    ...
                </Typography>
                <Button disabled={simulation === simulations.length - 1} onClick={() => toSimulation(simulations.length - 1)}>
                    {simulations.length}
                </Button>
                <Button className={classes.button} onClick={toSummary}>
                    Summary
                </Button>
            </div>
            <div style={{ position: "relative", height: 600, width: 800 }}>
                <div id="game-container" ref={gameContainerElement} />
                <div className={classes.summary} style={{ display: showSummary ? "block" : "none" }}>
                    <Summary simulation={simulations[simulation]} />
                </div>
            </div>
            <div className={classes.controls}>
                <IconButton onClick={() => pause(!isPaused)}>
                    {
                        isPaused ? <PlayCircleOutline /> : <PauseCircleOutline />
                    }
                </IconButton>
                {
                    SPEEDS.map(s => (
                        <Button className={classes.button} disabled={speed === s} onClick={() => changeSpeed(s)}>
                            x{s}
                        </Button>
                    ))
                }
                <Button className={classes.button} disabled={showSummary} onClick={endSimulation}>
                    End Run
                </Button>
            </div>
        </div>
    )
}

const useStyles = makeStyles(() => ({
    controls: {
        display: "flex",
        flexFlow: "row",
        width: "100%",
        alignContent: "center",
        alignItems: "center",
        justifyItems: "center",
        justifyContent: "center",
    },
    summary: {
        position: "absolute",
        top: 250,
        left: 250,
    },
    button: {
        textTransform: "none",
    }
}));

export default GamePlayer;