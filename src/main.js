import "./styles/main.css";
import { renderHeader } from "./components/header.js";
import { renderFooter } from "./components/footer.js";
import { startRouter } from "./router.js";

renderHeader();
renderFooter();
startRouter();
