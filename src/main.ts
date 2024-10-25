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
let toolPreview: ToolPreview | null = null;
let stickerPreview: StickerPreview | null = null;
let linewidth: number = 1;
let currentSticker: string | null = null;

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
        ctx.arc(x, y, 1, 0, Math.PI / 2);
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

class ToolPreview {
    private x: number;
    private y: number;

    constructor(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    display(ctx: CanvasRenderingContext2D) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, linewidth / 2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill()
      ctx.closePath();
    }
}

class Sticker {
    private x: number;
    private y: number;
    private content: string;
  
    constructor(x: number, y: number, content: string) {
      this.x = x;
      this.y = y;
      this.content = content;
    }
  
    drag(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "24px Arial";
      ctx.fillText(this.content, this.x, this.y);
    }
}

class StickerPreview {
    private x: number;
    private y: number;
    private content: string;
  
    constructor(x: number, y: number, content: string) {
      this.x = x;
      this.y = y;
      this.content = content;
    }
  
    updatePosition(x: number, y: number) {
      this.x = x;
      this.y = y;
    }
  
    display(ctx: CanvasRenderingContext2D) {
      ctx.font = "24px Arial";
      ctx.fillText(this.content, this.x, this.y);
    }
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopdraw);
canvas.addEventListener("drawing-changed", redraw);

function start(e: MouseEvent) {
    if (currentSticker) {
        const sticker = new Sticker(e.offsetX, e.offsetY, currentSticker);
        lines.push(sticker as unknown as MarkerLine);
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else {
        cursor.active = true;
        currentline = new MarkerLine(e.offsetX, e.offsetY, linewidth);
        if (ctx){
            currentline.display(ctx);
        }
      }
    redoline = [];
}

function draw(e: MouseEvent) {
    if (cursor.active && currentline) {
        currentline.drag(e.offsetX, e.offsetY);
        if (ctx){
            currentline.display(ctx);
        }
    } else {
        if (currentSticker) {
            redraw();
            stickerPreview = new StickerPreview(e.offsetX, e.offsetY, currentSticker);
            stickerPreview.display(ctx!);
        } else {
            if (!toolPreview) {
              toolPreview = new ToolPreview(e.offsetX, e.offsetY);
            } else {
              toolPreview.updatePosition(e.offsetX, e.offsetY);
            }
            if (!cursor.active && toolPreview) {
                toolPreview.display(ctx!);
            }
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

const sticker1Button = document.createElement("button");
sticker1Button.textContent = "🌟";
app.append(sticker1Button);
const sticker2Button = document.createElement("button");
sticker2Button.textContent = "✨";
app.append(sticker2Button);
const sticker3Button = document.createElement("button");
sticker3Button.textContent = "🔥";
app.append(sticker3Button);

sticker1Button.addEventListener("click", () => {
    currentSticker = "🌟";
    redraw();
});
sticker2Button.addEventListener("click", () => {
    currentSticker = "✨";
    redraw();
});
sticker3Button.addEventListener("click", () => {
    currentSticker = "🔥";
    redraw();
});


const widthnum = document.createElement("div");
widthnum.innerHTML = "<br/>" + "Linewidth: " + `${linewidth}`;
app.append(widthnum);

//thin button
const thinButton = document.createElement("button");
thinButton.innerHTML = "-";
app.append(thinButton);
thinButton.addEventListener("click", () => {
    currentSticker = null;
    redraw();
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
    currentSticker = null;
    redraw();
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
//     var