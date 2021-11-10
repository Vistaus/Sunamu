/* eslint-disable no-unused-vars */
import { Update } from "../types";
import * as MPRIS2 from "./mpris2";

const player: Player = {
	init: (_callback: Function) => new Promise(resolve => resolve()),
	getUpdate: () => new Promise(resolve => resolve(null)),
	Play: () => undefined,
	Pause: () => undefined,
	PlayPause: () => undefined,
	Stop: () => undefined,
	Next: () => undefined,
	Previous: () => undefined,
	Shuffle: () => undefined,
	Repeat: () => undefined,
	Seek: (_offset: number) => undefined,
	SeekPercentage: (_percentage: number) => undefined,
	GetPosition: () => undefined,
};
export default player;

switch(process.platform){
	case "linux":
		Object.assign(player, MPRIS2);
		break;
	default:
		console.error("Player: Unsupported platform!");
		break;
}

export interface Player {
	init(callback: Function): Promise<void>
	getUpdate(): Promise<Update | null>

	Play(): void
	Pause(): void
	PlayPause(): void
	Stop(): void

	Next(): void
	Previous(): void

	Shuffle(): void
	Repeat(): void

	Seek(offset: number): void
	SeekPercentage(percentage: number): void
	GetPosition(): number | undefined
}