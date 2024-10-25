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
const cursor = { active: false, x: 0, y: 0 };
let lines: Array<MarkerLine> = [];
let redoline: Array<MarkerLine> = [];
let currentline: MarkerLine | null = null;
let linewidth: number = 1;

class MarkerLine {
    private points: { x: number, y: number }[] = [];
    private thickness: number;
    constructor(initialX: number, initialY: number, thickness: number) {
      this.points.push({ x: initialX, y: initialY });
      this.thickness = thickness;
    }
  
    drag(x: number, y: number): void {
      this.points.push({ x, y });
    }
  
    display(ctx: CanvasRenderingContext2D): void {
      ctx.beginPath();
      ctx.lineWidth = this.thickness;
      if (this.points.length === 1) {
        const { x, y } = this.points[0];
        ctx.arc(x, y, 1, 0, Math.PI);
        ctx.fill();
      } else if (this.points.length > 1) {
        ctx.moveTo(this.points[0].x, this.points[0].y);
        for (let i = 1; i < this.points.length; i++) {
          ctx.lineTo(this.points[i].x, this.points[i].y);
        }
        ctx.stroke();
      }
      ctx.closePath();
    }
  }

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopdraw);
canvas.addEventListener("drawing-changed", redraw);

function start(e: MouseEvent) {
    cursor.active = true;
    currentline = new MarkerLine(e.offsetX, e.offsetY, linewidth);
    if (ctx){
        currentline.display(ctx);
    }
    redoline = [];
}

function draw(e: MouseEvent) {
    if (cursor.active && currentline) {
        currentline.drag(e.offsetX, e.offsetY);
        if (ctx){
            currentline.display(ctx);
        }
    }
}

function stopdraw(e: MouseEvent) {
    if (cursor.active && currentline) {
        lines.push(currentline);
        currentline = null;
        cursor.active = false;
        canvas.dispatchEvent(new Event("drawing-changed"));
    }
}

function redraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach(line => {
        line.display(ctx);
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
    if (ctx){
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lines = [];
        redoline = [];
    }
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

const widthnum = document.createElement("div");
widthnum.innerHTML = "<br/>" + "Linewidth: " + `${linewidth}`;
app.append(widthnum);

//thin button
const thinButton = document.createElement("button");
thinButton.innerHTML = "-";
app.append(thinButton);
thinButton.addEventListener("click", () => {
    if (linewidth > 1){
        linewidth -= 1;
        widthnum.innerHTML = "<br/>" + "Linewidth: " + `${linewidth}`;
    }
});

//thick button
const thickButton = document.createElement("button");
thickButton.innerHTML = "+";
app.append(thickButton);
thickButton.addEventListener("click", () => {
    if (linewidth < 5 ){
        linewidth += 1;
        widthnum.innerHTML = "<br/>" + "Linewidth: " + `${linewidth}`;
    }
});



// const slider = document.createElement("input");
// slider.type = "range";
// slider.min = "0";
// slider.max = "100";
// slider.value = "10";
// const value = document.createElement("div");
// value.innerHTML = slider.value;
// slider.addEventListener("input", () => {
//     value.innerHTML = slider.value;
//     var num: number = +slider.value;
//     linewidth = num / 10;
// });
// app.appendChild(slider);
// app.append(value);