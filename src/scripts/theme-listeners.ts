import { getHue, getStoredTheme, setHue, setTheme } from "@utils/setting-utils";

function setClickOutsideToClose(panel: string, ignores: string[]) {
    document.addEventListener("click", (event) => {
        const panelDom = document.getElementById(panel);
        const tDom = event.target;
        if (!(tDom instanceof Node)) return;
        for (const ig of ignores) {
            const ie = document.getElementById(ig);
            if (ie === tDom || ie?.contains(tDom)) return;
        }
        if (!panelDom) return;
        panelDom.classList.add("float-panel-closed");
    });
}

setClickOutsideToClose("display-setting", [
    "display-setting",
    "display-settings-switch",
]);
setClickOutsideToClose("nav-menu-panel", ["nav-menu-panel", "nav-menu-switch"]);
setClickOutsideToClose("search-panel", [
    "search-panel",
    "search-bar",
    "search-switch",
]);

export function loadTheme(): void {
    const theme = getStoredTheme();
    setTheme(theme);
}

export function loadHue(): void {
    setHue(getHue());
}

let initialLoadAnimationCleared = false;

export function clearInitialLoadAnimation(): void {
    if (initialLoadAnimationCleared) return;
    initialLoadAnimationCleared = true;
    document.documentElement.classList.remove("initial-load");
}
