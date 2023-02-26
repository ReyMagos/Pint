import { render } from "preact"
import { App } from "./app"
import "./index.css"
import {TemplatesProvider} from "./TemplatesProvider";
import {CategoryScale, Chart, Legend, LinearScale, LineController, LineElement, PointElement, Tooltip} from "chart.js";

Chart.register(LineController, CategoryScale, LinearScale, PointElement, LineElement, Legend, Tooltip)

// TemplatesProvider.init()
render(<App />, document.getElementById("app") as HTMLElement)
