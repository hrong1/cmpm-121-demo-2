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
let linewidth: number = 5;
let currentSticker: string | null = null;
let Stickerarray: string[] = ["🌟", "✨", "🔥"]

class MarkerLine {
    private points: { x: number, y: number }[] = [];
    private thickness: number;
    private color: string;

    constructor(initialX: number, initialY: number, thickness: number, color: string) {
        this.points.push({ x: initialX, y: initialY });
        this.thickness = thickness;
        this.color = color;
    }
  
    drag(x: number, y: number): void {
        this.points.push({ x, y });
    }
  
    display(ctx: CanvasRenderingContext2D): void {
        ctx.beginPath();
        ctx.lineWidth = this.thickness;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        if (this.points.length === 1) {
            const { x, y } = this.points[0];
            ctx.arc(x, y, this.thickness / 2, 0, Math.PI * 2);
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
  
    display(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, linewidth / 2, 0, Math.PI * 2);
        ctx.fill();
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
        ctx.font = "30px Arial";
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
  
    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "30px Arial";
        ctx.fillText(this.content, this.x, this.y);
    }
}

canvas.addEventListener("mousedown", start);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopdraw);
canvas.addEventListener("mouseout", stopdraw);
canvas.addEventListener("mouseout", redraw);
canvas.addEventListener("drawing-changed", redraw);
canvas.addEventListener("mouseout", enablecursor);
canvas.addEventListener("mousemove", unablecursor);


// diplay cursor when mouse out canvas
function enablecursor(e: MouseEvent){
    document.body.style.cursor = "auto";
}

// hide cursor when mouse in canvas
function unablecursor(e: MouseEvent){
    document.body.style.cursor = "none";
    if (e.offsetX >= 0 && e.offsetX <= canvas.width && e.offsetY >= 0 && e.offsetY <= canvas.height) {
        document.body.style.cursor = "none";
      }
}


function start(e: MouseEvent) {
    redraw();
    if (currentSticker) {
        const sticker = new Sticker(e.offsetX, e.offsetY, currentSticker);
        lines.push(sticker as unknown as MarkerLine);
        canvas.dispatchEvent(new Event("drawing-changed"));
    } else {
        cursor.active = true;
        let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        currentline = new MarkerLine(e.offsetX, e.offsetY, linewidth, color);
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
            redraw();
            toolPreview = new ToolPreview(e.offsetX, e.offsetY);
            toolPreview.display(ctx!);
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

// export button
const exportButton = document.createElement("button");
exportButton.innerHTML = "export";
app.append(exportButton);
exportButton.addEventListener("click", () => {
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = 1024;
    tempCanvas.height = 1024;
    const tempCtx = tempCanvas.getContext("2d");
    if (tempCtx){
        tempCtx.scale(4, 4);
        tempCtx.fillStyle = "white";
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.fill();
        tempCtx.fillStyle = "black";
        lines.forEach((line) => line.display(tempCtx));
    }
    const anchor = document.createElement("a");
    anchor.href = tempCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();

});

const widthnum = document.createElement("div");
widthnum.innerHTML = "Linewidth: " + `${linewidth}`;
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
        widthnum.innerHTML = "Linewidth: " + `${linewidth}`;
    }
});

//thick button
const thickButton = document.createElement("button");
thickButton.innerHTML = "+";
app.append(thickButton);
thickButton.addEventListener("click", () => {
    currentSticker = null;
    redraw();
    if (linewidth < 10 ){
        linewidth += 1;
        widthnum.innerHTML = "Linewidth: " + `${linewidth}`;
    }
});

const newText = document.createElement("div");
newText.innerHTML = "";
app.append(newText);

// button cantainer for sticker
const container = document.createElement('button-container');
function addstickerButton() {
    if (container){
        container.innerHTML = '';
    }
    Stickerarray.forEach((sticker) => {
        const StickerButton = document.createElement("button");
        StickerButton.innerHTML = sticker;
        StickerButton.addEventListener("click", () => {
            currentSticker = sticker;
            redraw();
        });
        if (container){
            container.appendChild(StickerButton);
        }
    });
}
addstickerButton();
app.append(container);

const addsticker = document.createElement("button");
addsticker.innerHTML = "+";
app.append(addsticker);
addsticker.addEventListener("click", () => {
    let newsticker = prompt("Please enter your new sticker");
    if (newsticker != null && Stickerarray.includes(newsticker.trim())){        // check sticker exists or not
        alert("Sticker exists! Please enter another sticker");     
    }else if (newsticker != null && newsticker.trim() !== "") {         // push sticker into array and update button
        Stickerarray.push(newsticker);
        addstickerButton(); // call add sticker function
    } else{         // send error message
        alert("Input is empty! Please enter it again");
    }
});

//color value
let hue: number = 0;
let saturation: number = 100;
let lightness: number = 0;

const slider = document.createElement("input");
slider.type = "range";
slider.min = "0";
slider.max = "360";
slider.value = "0";
slider.addEventListener("input", () => {
    hue = +slider.value;
    lightness = 50;
    colorText.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    currentSticker = null;
    redraw();
});

const colorText = document.createElement("button");
colorText.innerHTML = "Color";
colorText.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

const blackbottom = document.createElement("button");
blackbottom.innerHTML = "Change Color to Black";
blackbottom.addEventListener("click", () => {
    lightness = 0;
    colorText.style.backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
});

const blockText = document.createElement("div");
blockText.innerHTML = "";
app.append(blockText);

app.append(colorText);
app.append(slider);
app.append(blackbottom);