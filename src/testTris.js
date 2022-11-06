
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
document.body.appendChild(canvas);
ctx.strokeStyle = "black" ;
canvas.width = 1024;
canvas.height = 1024;

const cells_x = 34;
const cells_y = 34;
const cells_w = canvas.width/cells_x;
const cells_h = canvas.height/cells_y;

const data = {
	grid: [],
};

const mouse = {
	right: false,
	down: false,
	x: 0, y: 0
};

init();
animate();

function init() {
	canvas.addEventListener("mousedown", mousedown);
	canvas.addEventListener("mouseup", mouseup);
	canvas.addEventListener("mousemove", mousemove);
	for (let x = 0; x < cells_x; x++) {
		const row = [];
		data.grid.push(row);
		for (let y = 0; y < cells_y; y++) {
			row.push(0);
		}
	}
	//data.grid[3][3] = 1;
	//data.grid[12][10] = 0.75;
	//data.grid[8][10] = 0.6;
	//data.grid[6][10] = 0.55;
	//data.grid[1][2] = 0.55;
}

function mousedown(evt) {
	if (evt.buttons & 2) {
		mouse.right = true;
		evt.preventDefault();
	}
	if (evt.buttons & 1) mouse.down = true;
}

function mouseup(evt) {
	if (evt.buttons & 2) {
		mouse.right = true;
	}else mouse.right = false;
	if (evt.buttons & 1) {
		mouse.down = true;
	}else mouse.down = false;
}

function mousemove(evt) {
	const rect = canvas.getBoundingClientRect();
	mouse.x = evt.clientX - rect.x;
	mouse.y = evt.clientY - rect.y;
}

function washValues_(x, y,d) {
	const did = [];
	const todo = [];
	todo.push({ x, y, d: d });
	let cell = null;
	while (cell = todo.shift()) {
		if (cell.x < 0 || cell.y < 0) continue;
		if (cell.x >= data.grid.length || cell.y >= data.grid[0].length) continue;
		did.pop(cell);
		data.grid[cell.x][cell.y] += cell.d;
		let over = 0;
		if( data.grid[cell.x][cell.y] > 1 ) {
			over = data.grid[cell.x][cell.y]-1;
			data.grid[cell.x][cell.y] = 1;
		}
		if( over )
		{
			const near = [{ x: cell.x + 1, y:cell.y, d: over / 4 }
				, { x:cell.x, y: cell.y + 1, d: over / 4 }
				, { x: cell.x - 1, y:cell.y, d: over / 4 }
				, { x:cell.x, y: cell.y - 1, d: over / 4 }];
			let willdo = 0;
			for (let n of near)
				if (!did.find(old => (old.x == n.x) && (old.y === n.y)))
					if (!todo.find(old => (old.x == n.x) && (old.y === n.y))) {
						todo.push(n);
						willdo++;		
					}			
			if( willdo )					
				for( let n of near ) n.d = over/willdo;
		}
	}
}

function washValues(x, y) {
	washValues_( x, y, data.grid[x][y]-1 );
}

function animate() {

	if (mouse.down) {
		const cellx = Math.floor(mouse.x / cells_w - 0.5 + 1);
		const celly = Math.floor(mouse.y / cells_h - 0.5 + 1);
		if (mouse.right) 
			data.grid[cellx][celly] -= 0.05;
			else
			data.grid[cellx][celly] += 0.05;
		if (data.grid[cellx][celly] > 1) washValues(cellx, celly);
	}
ctx.clearRect( 0, 0, canvas.width, canvas.height );
	{
		ctx.beginPath();
		ctx.strokeStyle = "red";
		const mx = Math.floor((mouse.x+cells_w/2)/cells_w );
		const my = Math.floor((mouse.y+cells_h/2)/cells_h );
		ctx.moveTo( mx * cells_w - cells_w/2+cells_w/10, my*cells_h - cells_h/2+cells_w/10 );
		ctx.lineTo( (mx+1) * cells_w - cells_w/2-cells_w/10, my*cells_h - cells_h/2+cells_w/10 );
		ctx.lineTo( (mx+1) * cells_w - cells_w/2-cells_w/10, (my+1)*cells_h - cells_h/2-cells_w/10 );
		ctx.lineTo( (mx) * cells_w - cells_w/2+cells_w/10, (my+1)*cells_h - cells_h/2 -cells_w/10);
		ctx.lineTo( mx * cells_w - cells_w/2+cells_w/10, my*cells_h - cells_h/2+cells_w/10 );
		ctx.stroke();
	}
	ctx.strokeStyle = "black";
	for (let x = 0; x < cells_x-1; x++) {
		const row0 = data.grid[x];
		const row1 = data.grid[x + 1];


		for (let y = 0; y < cells_y-1; y++) {
			const odd = (x + y) & 1;
			{
			// checkerboard framing
				ctx.fillStyle = odd?"#00000030":"#30000030";
				ctx.fillRect( x*cells_w-cells_w/2, y*cells_h-cells_h/2, cells_w, cells_h );
			}

			let d = 0, d1 = 0, d2 = 0, d3 = 0, d4 = 0, d5 = 0;
			let hasPnt = [false, false, false, false, false];
			let points = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
			// odd cell is 0,0 - 1,1
			// even cell is 0,1 - 1,0
			if (odd) {
				const a = row0[y] - 0.5;
				const b = row1[y + 1] - 0.5;
				if (a < 0 && b >= 0) {
					// a = 0,0 and is < 0 crosses diagonal
					// b is 1,1 and is > 0
					d = (b) / (b - a);
					points[4][0] = x + 1-d;
					points[4][1] = y + 1-d;
					hasPnt[4] = true;
					/*
					console.log( "crosses center", x, y, d, a, b )
					ctx.fillStyle = "#005";
					ctx.fillRect( points[4][0]*cells_w, points[4][1]*cells_h, 10, 10 );
					*/
				} else if (b < 0 && a >= 0) {

					// a = 0,0 and is > 0 crosses diagonal
					// b is 1,1 and is < 0

					d = (a) / (a - b);
					points[4][0] = x +d;
					points[4][1] = y +d;
					hasPnt[4] = true;
					/*
					console.log( "crosses center2", x, y, d, a, b )
					ctx.fillStyle = "#050";
					ctx.fillRect( points[4][0]*cells_w, points[4][1]*cells_h, 10, 10 );
					*/
				}
			} else {
				const a = row0[y + 1] - 0.5;
				const b = row1[y] - 0.5;
				// a is 0,1
				// b is 1,0
				if (a < 0 && b >= 0) {
					d = (b) / (b - a);
					points[4][0] = x  + 1-d;
					points[4][1] = y + d;
					hasPnt[4] = true;
					/*
					ctx.fillStyle = "#500";
					ctx.fillRect( points[4][0]*cells_w, points[4][1]*cells_h, 10, 10 );
					console.log( "crosses center3", x, y, d, a, b )
					*/
				} else if (b < 0 && a >= 0) {
					d = (a) / (a - b);
					points[4][0] = x + d;
					points[4][1] = y + 1-d;
					hasPnt[4] = true;
					/*
					ctx.fillStyle = "#505";
					ctx.fillRect( points[4][0]*cells_w, points[4][1]*cells_h, 10, 10 );
					*/
					//console.log( "crosses center4", x, y, d )
				}
			}

			{
				// 0,0 - 0,1
				// a = 0,0
				// b = 0,1
				const a = row0[y] - 0.5
				const b = row0[y + 1] - 0.5;
				const del = a - b;
                if (a >= 0 && b < 0) {
					d2 = -b / del;
					points[0][0] = x;
					points[0][1] = y + 1-d2;
					hasPnt[0] = true;
					//console.log( "Point 0(1) is", x, y, d2, points[0] );
				} else if (b >= 0 && a < 0) {
					d2 = a / del;
					points[0][0] = x;
					points[0][1] = y + d2;
					hasPnt[0] = true;
					//console.log( "Point 0(2) is", x, y, d2, points[0] );
				}
			}
			{
				// 1,0 - 1,1
				const a = row1[y] - 0.5;
				const b = row1[y + 1] - 0.5;
				const del = a - b;
				if (a >= 0 && b < 0) {
					d3 = -b / del;
					points[1][0] = x + 1;
					points[1][1] = y + 1- d3;
					hasPnt[1] = true;
				} else if (b >= 0 && a < 0) {
					d3 = a / del;
					points[1][0] = x + 1;
					points[1][1] = y + d3;
					hasPnt[1] = true;
				}
			}

			{
				// 0,0 - 1,0
				const a = row0[y] - 0.5;
				const b = row1[y] - 0.5;

				const del = a - b;
				if (a >= 0 && b < 0) {
					d4 = -b / del;
					points[2][0] = x +1- d4;
					points[2][1] = y ;
					hasPnt[2] = true;
				} else if (b >= 0 && a < 0) {
					d4 = a / del;
					points[2][0] = x + d4;
					points[2][1] = y ;
					hasPnt[2] = true;
				}
			}
			{
				// 0,1 - 1,1
				const a = row0[y + 1] - 0.5;
				const b = row1[y + 1] - 0.5;
				const del = a - b;
				if (a >= 0 && b < 0) {
					d5 = -b / del;
					points[3][0] = x + 1-d5;
					points[3][1] = y + 1;
					hasPnt[3] = true;
				} else if (b >= 0 && a < 0) {
					d5 = a / del;
					points[3][0] = x +d5;
					points[3][1] = y + 1;
					hasPnt[3] = true;
				}
			}
			if( !odd )
			if (hasPnt[0] && hasPnt[2]) {
				ctx.beginPath();
				ctx.strokeStyle = "#f00"
				ctx.moveTo(points[0][0] * cells_w, points[0][1] * cells_h);
				ctx.lineTo(points[2][0] * cells_w, points[2][1] * cells_h);
				ctx.stroke();
				//console.log( "DID:", points[0], points[2])
			}
			if( odd )
			if (hasPnt[0] && hasPnt[3]) {
				ctx.beginPath();
				ctx.strokeStyle = "#0f0"
				ctx.moveTo(points[0][0] * cells_w, points[0][1] * cells_h);
				ctx.lineTo(points[3][0] * cells_w, points[3][1] * cells_h);
				ctx.stroke();
			}
			if( odd )
			if (hasPnt[1] && hasPnt[2]) {
				ctx.beginPath();
				ctx.strokeStyle = "#00f"
				ctx.moveTo(points[1][0] * cells_w, points[1][1] * cells_h);
				ctx.lineTo(points[2][0] * cells_w, points[2][1] * cells_h);
				ctx.stroke();
			}
			if( !odd )
			if (hasPnt[1] && hasPnt[3]) {
				ctx.beginPath();
				ctx.strokeStyle = "#ff0"
				ctx.moveTo(points[1][0] * cells_w, points[1][1] * cells_h);
				ctx.lineTo(points[3][0] * cells_w, points[3][1] * cells_h);
				ctx.stroke();
			}
			
			if (hasPnt[0] && hasPnt[4]) {
				ctx.beginPath();
				ctx.strokeStyle = "#f0f"
				//console.log( "This line ends:", x, y, points[0], points[4])
				ctx.moveTo(points[0][0] * cells_w, points[0][1] * cells_h);
				ctx.lineTo(points[4][0] * cells_w, points[4][1] * cells_h);
				ctx.stroke();
			}
			if (hasPnt[1] && hasPnt[4]) {
				ctx.beginPath();
				ctx.strokeStyle = "#0ff"
				ctx.moveTo(points[1][0] * cells_w, points[1][1] * cells_h);
				ctx.lineTo(points[4][0] * cells_w, points[4][1] * cells_h);
				ctx.stroke();
			}
			if (hasPnt[2] && hasPnt[4]) {
				ctx.beginPath();
				ctx.strokeStyle = "#700"
				//console.log( "This line ends:", x, y, points[2], points[4])
				ctx.moveTo(points[2][0] * cells_w, points[2][1] * cells_h);
				ctx.lineTo(points[4][0] * cells_w, points[4][1] * cells_h);
				ctx.stroke();
			}
			
			if (hasPnt[3] && hasPnt[4]) {
				ctx.beginPath();
				ctx.strokeStyle = "#070"
				//console.log( "This line ends:", x, y, points[3], points[4])
				ctx.moveTo(points[3][0] * cells_w, points[3][1] * cells_h);
				ctx.lineTo(points[4][0] * cells_w, points[4][1] * cells_h);
				ctx.stroke();
			}
		}
	}
	requestAnimationFrame(animate);
}

