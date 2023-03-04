import { render } from "preact"
import { App } from "./app"
import "./index.less"
import {TemplatesProvider} from "./templates/provider";
import {CategoryScale, Chart, Legend, LinearScale, LineElement, ScatterController, LineController, PointElement, Tooltip} from "chart.js";
import {ProcessController} from "./process/controller";
import {Config} from "src/config";

Chart.register(ScatterController, LineController, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip)

TemplatesProvider.init()
ProcessController.init()
Config.init()
render(<App />, document.getElementById("app") as HTMLElement)
