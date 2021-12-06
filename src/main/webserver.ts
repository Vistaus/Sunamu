import { stat } from "fs/promises";
import { resolve } from "path";
import getPlayer, { Player } from "./player";
import { getAll as getAllConfig } from "./config";
import { widgetModeWeb, debugMode, useElectron } from "./appStatus";
import { getAppData } from "./util";

import { Server, Socket } from "socket.io";
import { createServer } from "http";
import { Server as StaticServer } from "node-static";
import { addLyricsUpdateCallback, addUpdateCallback, updateInfo, sendSongData } from "./playbackStatus";

let player: Player;

const file = new StaticServer(resolve(__dirname, "..", "www"), { indexFile: "index.htm" });
const server = createServer((req, res) => file.serve(req, res));

export const io = new Server(server);

function registerSocketIO(socket: Socket) {

	socket.on("previous", () => player.Previous());
	socket.on("playPause", () => player.PlayPause());
	socket.on("next", () => player.Next());

	socket.on("shuffle", () => player.Shuffle());
	socket.on("repeat", () => player.Repeat());

	socket.on("seek", (perc) => player.SeekPercentage(perc));
	socket.on("getPosition", async (callback) => callback(await player.GetPosition()));

	socket.on("requestUpdate", async () => await updateInfo());
	socket.on("requestSongData", async () => await sendSongData(false));

	socket.on("getConfig", (callback) => callback(getAllConfig()));

	socket.on("shouldBullyGlasscordUser", async (callback) => {
		let bullyGlasscordUser = false;
		const gcPath = resolve(getAppData(), "glasscord");

		try {
			await stat(gcPath);
			bullyGlasscordUser = true;
			await stat(resolve(gcPath, "DONTBULLYME"));
			bullyGlasscordUser = false;
		} catch (_) {
			//...
		}

		callback(bullyGlasscordUser);
	});

	socket.on("isWidgetMode", (callback) => callback(widgetModeWeb));
	socket.on("isDebugMode", (callback) => callback(debugMode));
	socket.on("isElectronRunning", (callback) => callback(useElectron));

	addUpdateCallback(async (songdata, metadataChanged) => { socket.emit("update", songdata, metadataChanged); });
	addLyricsUpdateCallback(async () => { socket.emit("refreshLyrics"); });
}

export default async function webserverMain(){
	player = await getPlayer();

	server.listen(3000, () => console.log("WebServer listening on port 3000"));

	io.on("connection", socket => {
		registerSocketIO(socket);
	});
}
