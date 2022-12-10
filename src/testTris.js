
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.setAttribute( "tabIndex", 1 );
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

const keystate = {};


const corners = [
{ra:0,rb:1,ofs1:0,ofs2:1,p:4,xs:1,ys:1,xm:0,ym:0,yt:0,both:false,odd:true}  ,
{ra:0,rb:1,ofs1:1,ofs2:0,p:4,xs:1,ys:0,xm:0,ym:0,yt:1,both:false, odd:false}  ,

{ra:0,rb:0,ofs1:0,ofs2:1,p:0,xs:0,ys:1,xm:0,ym:0,yt:0,both:true}  ,
{ra:1,rb:1,ofs1:0,ofs2:1,p:1,xs:0,ys:0,xm:0,ym:1,yt:0,both:true}   ,
{ra:0,rb:1,ofs1:0,ofs2:0,p:2,xs:1,ys:0,xm:0,ym:0,yt:0,both:true}    ,
{ra:0,rb:1,ofs1:1,ofs2:1,p:3,xs:0,ys:0,xm:1,ym:0,yt:0,both:true}     
];


const draws = [

		{ both:false,odd:false, match0:0,match1:2 },
	{ both:false,odd:true, match0:0,match1:3 },
	{ both:false,odd:true, match0:1,match1:2 },
	{ both:false,odd:false, match0:1,match1:3 },
	{ both:true,odd:true, match0:0,match1:4 },
	{ both:true,odd:true, match0:1,match1:4 },
	{ both:true,odd:true, match0:2,match1:4 },
	{ both:true,odd:true, match0:3,match1:4 },
	];

init();
animate();

function init() {
	canvas.addEventListener("keydown", keydown);
	canvas.addEventListener("keyup", keyup);
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


function keydown(evt) {
//	console.log( "First, what do we get to check?", evt );
	if( !keystate[evt.code] )
		keystate[evt.code] = {
			down:true,
			now:Date.now() 
		}
	else  {
		keystate[evt.code].down = true;
		keystate[evt.code].now = Date.now() ;
	}
} 

function keyup( evt ) {
//	console.log( "final done, what do we get to check?", evt );
	keystate[evt.code].down = false;
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
		if( data.grid[cell.x][cell.y] < -1 ) {
			over = data.grid[cell.x][cell.y]+1;
			data.grid[cell.x][cell.y] = -1;
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
	do {
		const cellx = Math.floor(mouse.x / cells_w - 0.5 + 1);
		const celly = Math.floor(mouse.y / cells_h - 0.5 + 1);
		if( cellx >= data.grid.length || cellx < 0 ) break;
		if( celly >= data.grid[0].length || celly < 0 ) break;

	if( "ShiftLeft" in keystate && keystate.ShiftLeft.down ) {
		data.grid[cellx][celly] += 0.25;
		if (data.grid[cellx][celly] > 1) washValues(cellx, celly);
	}
	if( "ControlLeft" in keystate && keystate.ControlLeft.down ) {
		data.grid[cellx][celly] -= 0.05;
		if (data.grid[cellx][celly] < -1) washValues(cellx, celly);
		
	}
                                 
	if (mouse.down) {
		const cellx = Math.floor(mouse.x / cells_w - 0.5 + 1);
		const celly = Math.floor(mouse.y / cells_h - 0.5 + 1);
		if( cellx >= data.grid.length || cellx < 0 ) return;
		if( celly >= data.grid[0].length || celly < 0 ) return;
		if (mouse.right) 
			data.grid[cellx][celly] -= 0.05;
		else
			data.grid[cellx][celly] += 0.05;
		if (data.grid[cellx][celly] > 1) washValues(cellx, celly);
	}
	} while( false );

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

	let hasApnt = false;


	for (let x = 0; x < cells_x-1; x++) {
		for (let y = 0; y < cells_y-1; y++) {
			const odd = (x + y) & 1;
			if(1)
			{
				// checkerboard framing
				ctx.fillStyle = odd?"#00000030":"#30000030";
				ctx.fillRect( x*cells_w-cells_w/2, y*cells_h-cells_h/2, cells_w, cells_h );
			}

			let d = 0, d1 = 0, d2 = 0, d3 = 0, d4 = 0, d5 = 0;
			let hasPnt = [false, false, false, false, false];
			let points = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
			let hasApnt = false;
			// odd cell is 0,0 - 1,1
			// even cell is 0,1 - 1,0
			for( let corner of corners ) {
				// 0,0 - 0,1
				// a = 0,0
				// b = 0,1
				if( !corner.both && !corner.odd !== !odd ) continue;
				const a = data.grid[x+corner.ra][y+corner.ofs1] - 0.5
				const b = data.grid[x+corner.rb][y+corner.ofs2] - 0.5;
				const del = a - b;
				if (a >= 0 && b < 0) {
					const d2 = -b / del;
					points[corner.p][0] = x + (((corner.xs+corner.xm)*(1-d2) )+ (corner.ym)) ;
					points[corner.p][1] = y + (corner.xm)+((corner.ys+corner.ym)*(1-d2))+(corner.yt*(d2)  );
					hasPnt[corner.p] = true;
					hasApnt = true;
					//console.log( "Point 0(1) is", x, y, d2, points[0] );
				} else if (b >= 0 && a < 0) {
					const d2 = a / del;
					points[corner.p][0] = x + ((corner.xm+corner.xs)*(d2) + (corner.ym) );
					points[corner.p][1] = y + (corner.xm) + ((corner.ys+corner.ym)*(d2) +(corner.yt*(1-d2)) );
					hasPnt[corner.p] = true;
					hasApnt = true;
					//console.log( "Point 0(2) is", x, y, d2, points[0] );
				}
			}
			if( !hasApnt ) continue;

			for( let draw of draws ) {
				
				if( ( ( !draw.odd === !odd ) || (draw.both)) && hasPnt[draw.match0] && hasPnt[draw.match1]  )
				{
						ctx.beginPath();
						ctx.moveTo(points[draw.match0][0] * cells_w, points[draw.match0][1] * cells_h);
						ctx.lineTo(points[draw.match1][0] * cells_w, points[draw.match1][1] * cells_h);
						ctx.stroke();
				}
			}
		}
	}
	requestAnimationFrame(animate);
}

