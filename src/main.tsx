import { render } from "preact"
import { App } from "./app"
import "./index.less"
import {TemplatesProvider} from "./templates/provider";
import {Chart, registerables} from "chart.js";
import {ProcessController} from "./process/controller";
import {Config} from "src/config";

Chart.register(...registerables)

TemplatesProvider.init()
ProcessController.init()
Config.init()
render(<App />, document.getElementById("app") as HTMLElement)
