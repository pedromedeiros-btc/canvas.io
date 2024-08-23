const socket = io();
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const colorPicker = document.getElementById('colorPicker');
const brushSize = document.getElementById('brushSize');
const clearBtn = document.getElementById('clearBtn');
const saveBtn = document.getElementById('saveBtn');

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let myId = null;

canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mousemove', draw);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mouseout', stopDrawing);
clearBtn.addEventListener('click', clearCanvas);
saveBtn.addEventListener('click', saveImage);

socket.on('assignId', (id) => {
    myId = id;
});

function startDrawing(e) {
    isDrawing = true;
    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function draw(e) {
    if (!isDrawing) return;

    const drawData = {
        x0: lastX / canvas.width,
        y0: lastY / canvas.height,
        x1: e.offsetX / canvas.width,
        y1: e.offsetY / canvas.height,
        color: colorPicker.value,
        size: brushSize.value
    };

    drawLine(drawData);
    socket.emit('draw', drawData);

    [lastX, lastY] = [e.offsetX, e.offsetY];
}

function drawLine(data) {
    ctx.beginPath();
    ctx.moveTo(data.x0 * canvas.width, data.y0 * canvas.height);
    ctx.lineTo(data.x1 * canvas.width, data.y1 * canvas.height);
    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.size;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function stopDrawing() {
    isDrawing = false;
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
}

function saveImage() {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'canvas-image.png';
    link.href = dataURL;
    link.click();
}

socket.on('draw', (data) => {
    drawLine(data);
});

socket.on('clear', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
});

window.addEventListener('resize', () => {
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    tempCanvas.getContext('2d').drawImage(canvas, 0, 0);

    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.8;

    ctx.drawImage(tempCanvas, 0, 0);
});