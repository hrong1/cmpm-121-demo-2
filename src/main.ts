import "./style.css";
 
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = "Sticky Pad";
const header = document.createElement("h1");
header.innerHTML = "Sticky Pad";
app.append(header);


const canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

const ctx = canvas.getContext("2d");

interface Point {
    x: number;
    y: number;
}
  
let lines: Point[][] = [];
let currentline: Point[] = [];
let redoline: Point[][] = [];

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopdraw);
canvas.addEventListener("drawing-changed", redraw);

const cursor = { active: false, x: 0, y: 0 };

function start(e: MouseEvent) {
    cursor.active = true;
    redoline = [];
    currentline = [{ x: e.offsetX, y: e.offsetY }];
}

function draw(e: MouseEvent) {
    if (cursor.active) {
        const newX = e.offsetX;
        const newY = e.offsetY;
        currentline.push({ x: newX, y: newY });
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

function stopdraw(e: MouseEvent) {
    if (cursor.active) {
        lines.push(currentline);
        currentline = [];
        cursor.active = false;
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

function redraw() {
    if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lines.forEach(line => {
            for (let i: number = 1; i < line.length; i++) {
                ctx.beginPath();
                ctx.moveTo(line[i - 1].x, line[i - 1].y);
                ctx.lineTo(line[i].x, line[i].y);
                ctx.stroke();
                ctx.closePath();
            }

        });
}

const Text = document.createElement("div");
Text.innerHTML = "<br/>" + "";
app.append(Text);

// clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(clearButton);
clearButton.addEventListener("click", () => {
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.dispatchEvent(new Event("drawing-changed"));
    lines = [];
    redoline = [];
});

// undo button
const undoButton = document.createElement("button");
undoButton.innerHTML = "undo";
app.append(undoButton);
undoButton.addEventListener("click", () => {
    const line = lines.pop();
    if (line) {
        redoline.push(line);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});

//redo button
const redoButton = document.createElement("button");
redoButton.innerHTML = "redo";
app.append(redoButton);
redoButton.addEventListener("click", () => {
    const line = redoline.pop();
    if (line) {
        lines.push(line);
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
});




