
let highestZ = 20;
let activeWindow = null;

const windows = document.querySelectorAll(".window");
const taskbar = document.getElementById("taskbar-windows");
const startMenu = document.getElementById("start-menu");

// OPEN A WINDOW

function openWindow(id) {
    const win = document.getElementById(id);
    if (!win) return;

    win.style.display = "block";
    win.dataset.minimized = "false";

    if (win.classList.contains("maximized")) {
        win.classList.remove("maximized");
        delete win.dataset.previous;
        win.style.top = "40px";
        win.style.left = "30px";
    }

    focusWindow(win);
    updateTaskbar();
}

// BRING WINDOW TO FRONT

function focusWindow(win) {
    highestZ++;
    win.style.zIndex = highestZ;
    activeWindow = win;
    updateTaskbar();
}


// WINDOW CONTROLS

windows.forEach(win => {

    win.querySelectorAll(".window-controls button").forEach(button => {

        button.addEventListener("click", event => {

            event.stopPropagation();

            if (button.classList.contains("close")) {
                win.style.display = "none";
                win.classList.remove("maximized");
                win.dataset.minimized = "false";

                if (activeWindow === win) {
                    activeWindow = null;
                }

                updateTaskbar();
            }

            if (button.classList.contains("minimize")) {
                win.dataset.minimized = "true";
                win.style.display = "none";

                if (activeWindow === win) {
                    activeWindow = null;
                }

                updateTaskbar();
            }

            if (button.classList.contains("maximize")) {

                if (!win.classList.contains("maximized")) {

                    win.dataset.previous = JSON.stringify({
                        top: win.style.top,
                        left: win.style.left,
                        width: win.style.width,
                        height: win.style.height
                    });

                    win.classList.add("maximized");

                } else {

                    win.classList.remove("maximized");

                    const previous = JSON.parse(
                        win.dataset.previous || "{}"
                    );

                    win.style.top = previous.top || "80px";
                    win.style.left = previous.left || "180px";
                    win.style.width = previous.width || "";
                    win.style.height = previous.height || "";

                    delete win.dataset.previous;
                }

                focusWindow(win);
            }
        });
    });

    win.addEventListener("pointerdown", () => {
        if (win.style.display === "block") {
            focusWindow(win);
        }
    });

});


// DESKTOP ICONS

document.querySelectorAll(".desktop-icon").forEach(icon => {

    icon.addEventListener("click", () => {
        document.querySelectorAll(".desktop-icon").forEach(item => {
            item.classList.remove("selected");
        });

        icon.classList.add("selected");
    });

    icon.addEventListener("click", () => {
        openWindow(icon.dataset.window);
    });

});

// DRAG WINDOWS

document.querySelectorAll(".title-bar").forEach(bar => {

    let dragging = false;
    let offsetX = 0;
    let offsetY = 0;

    bar.addEventListener("pointerdown", event => {

        if (event.target.closest("button")) return;

        const win = bar.closest(".window");

        if (win.classList.contains("maximized")) return;

        dragging = true;

        focusWindow(win);

        const rect = win.getBoundingClientRect();

        offsetX = event.clientX - rect.left;
        offsetY = event.clientY - rect.top;

        bar.setPointerCapture(event.pointerId);
    });

    bar.addEventListener("pointermove", event => {

        if (!dragging) return;

        const win = bar.closest(".window");

        win.style.left = (event.clientX - offsetX) + "px";
        win.style.top = (event.clientY - offsetY) + "px";
    });

    bar.addEventListener("pointerup", () => {
        dragging = false;
    });

    bar.addEventListener("pointercancel", () => {
        dragging = false;
    });

});

// TASKBAR

function updateTaskbar() {

    taskbar.innerHTML = "";

    windows.forEach(win => {

        if (win.style.display !== "block" &&
            win.dataset.minimized !== "true") return;

        const button = document.createElement("button");

        button.className = "taskbar-window";
        button.textContent =
            win.querySelector(".title-bar > span").textContent;

        if (win === activeWindow) {
            button.classList.add("active");
        }

        button.addEventListener("click", () => {

            if (win.dataset.minimized === "true") {

                win.dataset.minimized = "false";
                win.style.display = "block";
                focusWindow(win);

            } else if (win === activeWindow) {

                win.dataset.minimized = "true";
                win.style.display = "none";
                activeWindow = null;

            } else {

                focusWindow(win);
            }

            updateTaskbar();
        });

        taskbar.appendChild(button);
    });
}

// START MENU

document.getElementById("start-button").addEventListener("click", event => {

    event.stopPropagation();

    startMenu.classList.toggle("open");
});

document.querySelectorAll(".start-menu-items [data-window]").forEach(button => {

    button.addEventListener("click", () => {

        openWindow(button.dataset.window);
        startMenu.classList.remove("open");

    });

});

// CLOSE START MENU WHEN CLICKING OUTSIDE

document.addEventListener("click", event => {

    if (
        !startMenu.contains(event.target) &&
        !document.getElementById("start-button").contains(event.target)
    ) {
        startMenu.classList.remove("open");
    }

});

// SHUT DOWN BUTTON

document.getElementById("shutdown").addEventListener("click", () => {

    windows.forEach(win => {
        win.style.display = "none";
        win.dataset.minimized = "false";
        win.classList.remove("maximized");
    });

    activeWindow = null;
    startMenu.classList.remove("open");
    updateTaskbar();

});

// CLOCK

function updateClock() {

    const now = new Date();

    document.getElementById("clock").textContent =
        now.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
}

updateClock();
setInterval(updateClock, 1000);
