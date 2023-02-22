/*
This software is Copyright ©️ 2020 The University of Southern California. All Rights Reserved. 
Permission to use, copy, modify, and distribute this software and its documentation for educational, research and non-profit purposes, without fee, and without a written agreement is hereby granted, provided that the above copyright notice and subject to the full license file found in the root of this software deliverable. Permission to make commercial use of this software may be obtained by contacting:  USC Stevens Center for Innovation University of Southern California 1150 S. Olive Street, Suite 2300, Los Angeles, CA 90115, USA Email: accounting@stevens.usc.edu

The full terms of this copyright and license should always be found in the root directory of this software deliverable as "license.txt" and if these terms are not found with this software, please contact the USC Stevens Center for the full license.
*/
import React, { useRef, useState } from "react";
import { Button, FormControl, InputLabel, MenuItem, Select } from "@mui/material"

import { Classifier, ClassifierInput, ClassifierOutput } from "../classifier"
import { Simulator, SimulationOutput } from "../simulator"
import FruitPicker from "../games/fruit-picker";
import FruitClassifier from "../games/fruit-picker/classifier";
import { FruitSimulator } from "../games/fruit-picker/simulator";

function GamePicker(props: {
    loadGame: (
        g: Phaser.Types.Core.GameConfig,
        c: Classifier<ClassifierInput, ClassifierOutput>,
        s: Simulator<SimulationOutput, Classifier<ClassifierInput, ClassifierOutput>>
    ) => void
}): JSX.Element {
    const [game, setGame] = useState<Phaser.Types.Core.GameConfig>();
    const [classifier, setClassifier] =
        useState<Classifier<ClassifierInput, ClassifierOutput>>();
    const [simulator, setSimulator] =
        useState<
            Simulator<SimulationOutput, Classifier<ClassifierInput, ClassifierOutput>>
        >();
    const [phaserGame, setPhaserGame] = useState<Phaser.Game>();
    const gameContainerElement = useRef<HTMLDivElement | null>(null);

    function select(): void {
        if (phaserGame) {
            phaserGame.destroy(true);
        }
        const game = FruitPicker;
        const classifier = new FruitClassifier();
        const simulator = new FruitSimulator(classifier);
        setGame(game);
        setClassifier(classifier);
        setSimulator(simulator);
        setPhaserGame(new Phaser.Game({
            ...game,
            parent: gameContainerElement.current as HTMLElement,
        }));
    }

    function play(): void {
        if (!phaserGame) {
            return;
        }
        phaserGame.scene.start("MainGame", {
            playManually: true,
            simulator: simulator,
        });
    }

    function confirm(): void {
        if (!game || !classifier || !simulator) {
            return;
        }
        props.loadGame(game, classifier, simulator);
    }

    return (
        <div>
            <FormControl fullWidth>
                <InputLabel>Select Game</InputLabel>
                <Select
                    value={game?.title}
                    label="Select Game"
                    onChange={select}
                >
                    <MenuItem value="Fruit Picker">Fruit Picker</MenuItem>
                </Select>
            </FormControl>
            <Button disabled={!phaserGame} onClick={confirm}>
                Confirm
            </Button>
            <Button disabled={!phaserGame} onClick={play}>
                Play
            </Button>
            <div id="game-container" ref={gameContainerElement} />
        </div>
    )
}

export default GamePicker