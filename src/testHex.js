
const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.setAttribute( "tabIndex", 1 );
document.body.appendChild(canvas);
ctx.strokeStyle = "black" ;
canvas.width = 1024;
canvas.height = 1024;

const cells_x = 14;
const cells_y = 14/0.75;
const cells_w = canvas.width/(cells_x+0.5);
const cells_h = canvas.height/(cells_y*0.75+0.5);
const ofsx = cells_w;
const ofsy = cells_h/2;

const data = {
	grid: [],
};

const mouse = {
	right: false,
	down: false,
	x: 0, y: 0
};

const keystate = [];

const dirkeys = ["left","ul","ur","right","lr","ll"];

const dirs =  [
{ /* even Y*/
	left: {x:-1,y:0},
	ul : { x:-1, y:-1},
	ur : { x:0, y:-1 },
	right:{x:1,y:0},
	lr : { x:0, y:1 },
	ll : { x:-1, y:1 },
}

, { /* odd Y*/
	left: {x:-1,y:0},
	ul : { x:0, y:-1},
	ur : { x:1, y:-1 },
	right:{x:1,y:0},
	lr : { x:1, y:1 },
	ll : { x:0, y:1 },
	
}
]



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
	const r = toHex( ((evt.clientX - rect.x)-ofsx), ((evt.clientY - rect.y)-ofsy) );
	mouse.x = r.x;
	mouse.y = r.y;
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
		const cellx = Math.floor(mouse.x - 0.5 + 1);
		const celly = Math.floor(mouse.y - 0.5 + 1);
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
		const cellx = Math.floor(mouse.x  - 0.5 + 1);
		const celly = Math.floor(mouse.y  - 0.5 + 1);
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
	//ctx.fillRect( 0, 0, canvas.width, canvas.height );	

	
	ctx.beginPath();
		ctx.strokeStyle = "red";
		ctx.lineWidth = 1;
	for( let x = -3; x < cells_x; x++ ) {
		for( let y = -3; y < cells_y; y++ ) {
			const cent = toReal( x, y );
			ctx.beginPath();
			ctx.fillStyle = (x&1)
									?(y&1)?"#cce":"#CEC"
									:(y&1)?"#ecc":"#eEC" ;
			ctx.moveTo( ofsx+cells_w*(cent.x - 0.5), ofsy+cells_h*(cent.y + 0.25) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 0.5), ofsy+cells_h*(cent.y - 0.25) );

			ctx.lineTo( ofsx+cells_w*(cent.x      ), ofsy+cells_h*(cent.y - 0.5) );

			ctx.lineTo( ofsx+cells_w*(cent.x + 0.5), ofsy+cells_h*(cent.y - 0.25) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 0.5), ofsy+cells_h*(cent.y + 0.25) );

			ctx.lineTo( ofsx+cells_w*(cent.x      ), ofsy+cells_h*(cent.y + 0.5) );
			ctx.closePath();
			ctx.stroke();
			ctx.fill();

			//ctx.close();
		}
	}

/*
	ctx.beginPath();
		ctx.strokeStyle = "blue";
		ctx.lineWidth = 3;
	for( let x = 0; x < nx; x++ ) {
		for( let y = 0; y < ny; y++ ) {
			if( x != 2 || y != 2 ) continue;
			const cent = toReal( x, y );
			ctx.moveTo( ofsx+cells_w*(cent.x - 2*0.25), ofsy+cells_h*(cent.y - 2*0.375) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 2*0.25), ofsy+cells_h*(cent.y - 2*0.375) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 2*0.5 ), ofsy+cells_h*(cent.y ) );

			ctx.lineTo( ofsx+cells_w*(cent.x + 2*0.25), ofsy+cells_h*(cent.y + 2*0.375) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 2*0.25), ofsy+cells_h*(cent.y + 2*0.375) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 2*0.5      ), ofsy+cells_h*(cent.y ) );
			ctx.closePath();
			ctx.stroke();

			//ctx.close();
		}
			ctx.stroke();
	}
*/

for( let z = 0; z < 3; z++ ) {

	ctx.beginPath();
		ctx.strokeStyle = "#ffbbbb80";
ctx.lineWidth = 1;
		ctx.font = "24px san-serif";
	for( let x = 0; x < cells_x; x++ ) {
		for( let y = 0; y < cells_y; y++ ) {
			const cent = toReal( x, y, z, z===2 );
			if( z == 2 ) ctx.fillStyle = "red";
			else if( z ) ctx.fillStyle = "blue";
			else ctx.fillStyle = "black";
			ctx.fillText( `${x},${y}`, ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.fillRect( ofsx+cells_w*(cent.x)-1, ofsy+cells_h*(cent.y)-1,3,3);

			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 0.5), ofsy+cells_h*(cent.y ) );
			
			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 0.5), ofsy+cells_h*(cent.y ) );

			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 0.25), ofsy+cells_h*(cent.y + 0.375) );
			
			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 0.25), ofsy+cells_h*(cent.y + 0.375) );


			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 0.25), ofsy+cells_h*(cent.y - 0.375) );
			
			ctx.moveTo( ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 0.25), ofsy+cells_h*(cent.y - 0.375) );

			                             }
}
			ctx.stroke();
}



	let firstPnt = false;
	let firstr = null;
	let firstdel = 0;
	let firstinv = false;

	let hasApnt = false;
	let lastDel = 0;
let chains = [];

	for (let x = -1; x <= cells_x; x++) {
		for (let y = -1; y <= cells_y; y++) {
			const odd = (y) & 1;
			const r0 = toReal( x, y );

				
				firstPnt = true;
				firstr = 0;
				if( hasApnt ) {
								ctx.strokeStyle = "green";
					ctx.stroke();
				}
				hasApnt = false;
				const here = (x < 0 || y < 0 || x>=cells_x || y >= cells_y)?-0.5:data.grid[x][y]-0.5;
				ctx.beginPath();
				ctx.strokeStyle = "black";
				let chain = [];
				for( let key of dirkeys ) {
					const hx = x+dirs[odd][key].x;
					const hy = y+dirs[odd][key].y;
					let outside = ( hx < 0 || hy < 0 || hx >= cells_x || hy >= cells_y );
					const d = outside?-0.5:data.grid[hx][hy]-0.5;
					const r = toReal( hx, hy );
					if( here > 0 ) {
						if( d <= 0 ) {
							// is a side, facing toward 'here'
							lastDel = (here)/(here-d);
							if( hasApnt ) {
								//ctx.lineTo( ofsx + cells_w*(r0.x+(r.x-r0.x)*lastDel), ofsy + cells_h*(r0.y+(r.y-r0.y)*lastDel) )
								chain.push( {x:ofsx + cells_w*(r0.x+(r.x-r0.x)*lastDel), y:ofsy + cells_h*(r0.y+(r.y-r0.y)*lastDel) } );
							} else {
								chain.push( {x:ofsx + cells_w*(r0.x+(r.x-r0.x)*lastDel), y:ofsy + cells_h*(r0.y+(r.y-r0.y)*lastDel) } );
								//ctx.moveTo( ofsx + cells_w*(r0.x+(r.x-r0.x)*lastDel), ofsy + cells_h*(r0.y+(r.y-r0.y)*lastDel) )
								hasApnt = true;
								if( firstPnt ) { firstr = r; firstdel = lastDel; firstinv = false; }
							}
						} else {
							if( chain.length < 2 ) chain.length = 0;
							else {
								chains.push( chain );
								chain = [];
							}
							hasApnt = false;
						}
					} else {

						if( d > 0 ) {
							lastDel = (d)/(d-here);
							if( hasApnt ) {
								chain.push( {x:ofsx + cells_w*(r.x+(r0.x-r.x)*lastDel), y:ofsy + cells_h*(r.y+(r0.y-r.y)*lastDel) } )
							} else {                                                                                                
								chain.push( {x:ofsx + cells_w*(r.x+(r0.x-r.x)*lastDel), y:ofsy + cells_h*(r.y+(r0.y-r.y)*lastDel) } )
								hasApnt = true;
								if( firstPnt ) { firstr = r; firstdel = lastDel; firstinv = true; }
							}
						} else {
							if( hasApnt ) {
								if( chain.length < 2 ) chain.length = 0;
								else {
									chains.push( chain );
									chain = [];
								}
								//ctx.stroke();
							}
							hasApnt = false;
						}
					}
					firstPnt = false;
					
				}
				if( firstr ) {
					if( firstinv )
						chain.push( {x:ofsx + cells_w*(firstr.x+(r0.x-firstr.x)*firstdel), y:ofsy + cells_h*(firstr.y+(r0.y-firstr.y)*firstdel) } );
						//ctx.lineTo( ofsx + cells_w*(firstr.x+(r0.x-firstr.x)*firstdel), ofsy + cells_h*(firstr.y+(r0.y-firstr.y)*firstdel) )
					else
						chain.push( {x:ofsx + cells_w*(r0.x+(firstr.x-r0.x)*firstdel)    , y:ofsy + cells_h*(r0.y+(firstr.y-r0.y)*firstdel) } ) ;
						//ctx.lineTo( ofsx + cells_w*(r0.x+(firstr.x-r0.x)*firstdel)    , ofsy + cells_h*(r0.y+(firstr.y-r0.y)*firstdel) )
					//ctx.stroke();
					hasApnt = false;
				}
				if( chain.length > 1 )
					chains.push( chain );
			}
	}
	for( let chain of chains ) {
		for( let c = 0; c < chain.length; c++ ) {
			if( c === 0 ) ctx.moveTo( chain[c].x, chain[c].y );
			else ctx.lineTo( chain[c].x, chain[c].y );
		}
	}
	ctx.stroke();




	ctx.beginPath();
		ctx.strokeStyle = "red";
		ctx.fillStyle = "#00ff0080";
		ctx.lineWidth = 1;
			const cent = toReal( mouse.x, mouse.y );
			ctx.moveTo( ofsx+cells_w*(cent.x - 0.5), ofsy+cells_h*(cent.y + 0.25) );
			ctx.lineTo( ofsx+cells_w*(cent.x - 0.5), ofsy+cells_h*(cent.y - 0.25) );

			ctx.lineTo( ofsx+cells_w*(cent.x      ), ofsy+cells_h*(cent.y - 0.5) );

			ctx.lineTo( ofsx+cells_w*(cent.x + 0.5), ofsy+cells_h*(cent.y - 0.25) );
			ctx.lineTo( ofsx+cells_w*(cent.x + 0.5), ofsy+cells_h*(cent.y + 0.25) );

			ctx.lineTo( ofsx+cells_w*(cent.x      ), ofsy+cells_h*(cent.y + 0.5) );
			ctx.closePath();
			ctx.stroke();
			ctx.fill();


/*
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

			let first = true;
			for( let draw of draws ) {
				
				if( ( ( !draw.odd === !odd ) || (draw.both)) && hasPnt[draw.match0] && hasPnt[draw.match1]  )
				{
					

			ctx.beginPath();
				ctx.strokeStyle = x & 1?"black":"#00ff00";

					ctx.fillStyle = "#008000";
					
						ctx.moveTo(points[draw.match0][0] * cells_w, points[draw.match0][1] * cells_h);
						ctx.lineTo(points[draw.match1][0] * cells_w, points[draw.match1][1] * cells_h);
			ctx.stroke();
				}
			}
			ctx.fill("evenodd");
		}
	}
*/
	requestAnimationFrame(animate);
}


function toHex(rx,ry,rz) {
	rz = rz || 0;
	rx /= cells_w;
	ry /= cells_h;

	ry /= 0.75;//1.688
	
	const z = Math.floor( rz + 0.5 );
	if( z&1 ) {
		ry -= 0.75;
	}
	
	const y = Math.floor( ry + 0.5 );
	if( y&1 )
		return {x:Math.floor(rx+0.5), y:Math.floor(ry+0.5)};
	else
		return {x:Math.floor(rx+1.0), y:Math.floor(ry+0.5)};
}


function toReal(hx,hy,hz,alt) {
   // hx=0, hy=0 == rx=0, ry=0;
	// rx = hx + (((hy%2)-1)/2
	// hx + 1 = rx + 1;
	// rx += (((hy%2)-1)/2;

	const z = Math.floor( hz + 0.5 );

if( alt )
{
	const rx = hx + (((hy%2)-1)/2 );
	const ry = hy * 0.75 + ( ( alt )?+0.5:0);
	const rz = hz * 0.75;

	return {x:rx, y:ry, z:rz };	
}else{
//	let ty = ry; while( ty < 0 ) ty += 2;
	const rx = hx + (hy<0?((hy&1)?1:0)+ (((hy%2)-1)/2 ): (((hy%2)-1)/2 )) +( ( z&1 )?+0.5:0);
	const ry = hy * 0.75 + ( ( z&1 )?+0.25:0);
	const rz = hz * 0.75;

		
	return {x:rx, y:ry, z:rz };	
}
}
