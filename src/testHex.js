
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
const ofsx = cells_w + cells_w *2;
const ofsy = cells_h/2+ cells_h *2;
let biasx = -3;
let biasy = -3;

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
	ul : { x:0, y:-1},
	ur : { x:1, y:-1 },
	right:{x:1,y:0},
	lr : { x:1, y:1 },
	ll : { x:0, y:1 },
	
}
,{ /* odd Y*/
	left: {x:-1,y:0},
	ul : { x:-1, y:-1},
	ur : { x:0, y:-1 },
	right:{x:1,y:0},
	lr : { x:0, y:1 },
	ll : { x:-1, y:1 },
}


]


const sidePoints = [ [-0.5, 0.25],[-0.5,-0.25],[0,-0.5],[0.5,-0.25],[0.5,0.25],[0,0.5]]


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
			now:Date.now(),
			downTick: 0
		}
	else  {
		keystate[evt.code].down = true;
		keystate[evt.code].now = Date.now() ;
	}
	evt.stopPropagation();
	evt.preventDefault()
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
	const rxy = toReal( x, y );
	while (cell = todo.shift()) {
		if (cell.x < 0 || cell.y < 0) continue;
		if (cell.x >= data.grid.length || cell.y >= data.grid[0].length) continue;
		did.push(cell);
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
			const odd = (cell.y)&1;
			const near = odd?[{ x: cell.x + 1, y:cell.y, d: 0 }
				, { x: cell.x, y:cell.y + 1, d: 0 }
				, { x: cell.x-1, y: cell.y + 1, d: 0 }
				, { x: cell.x-1, y: cell.y, d: 0 }
				, { x: cell.x -1, y:cell.y - 1, d: 0 }
				, { x: cell.x , y: cell.y - 1, d: 0 }
				]:[{ x: cell.x + 1, y:cell.y, d: 0 }
				, { x: cell.x+1, y:cell.y + 1, d: 0 }
				, { x: cell.x, y: cell.y + 1, d: 0 }
				, { x: cell.x-1, y: cell.y, d: 0 }
				, { x: cell.x, y:cell.y - 1, d: 0 }
				, { x: cell.x+1, y: cell.y - 1, d: 0 }
		];
			let willdo = 0;
			for (let n of near) {
				const nr = toReal( n.x-rxy.x, n.y-rxy.y );
				const nl = nr.x*nr.x + nr.y*nr.y;
				if (!did.find(old => (old.x == n.x) && (old.y === n.y))) {
					let doit=null;
					if (!(doit=todo.find(old => (old.x == n.x) && (old.y === n.y)))) {

						const order = todo.findIndex( old=> {
							const r = toReal( old.x-rxy.x, old.y-rxy.y );
							return r.x*r.y+r.y*r.y > nl; // order by distance to the center
						});
						if( order >= 0 ) todo.splice(order, 0, n);
						else todo.push(n);
						willdo++;		
					}else {
						near[near.indexOf(n)] = doit; // replace with the existing one
						willdo++;
					}
				}			
			}
			if( willdo )					
				for( let n of near ) n.d += over/willdo;
		}
	}
}

function washValues(x, y) {
	washValues_( x, y, data.grid[x][y]-1 );
}



function animate(tick) {
	do {
		const cellx = Math.floor(mouse.x - 0.5 + 1);
		const celly = Math.floor(mouse.y - 0.5 + 1);
		if( cellx >= data.grid.length || cellx < 0 ) break;
		if( celly >= data.grid[0].length || celly < 0 ) break;

	if( "ArrowLeft" in keystate && keystate.ArrowLeft.down ) {
		if( !keystate.ArrowLeft.downTick || keystate.ArrowLeft.downTick < tick ) {
			keystate.ArrowLeft.downTick = tick + 250;
			biasx -= 1;
		}
	}
	if( "ArrowRight" in keystate && keystate.ArrowRight.down ) {
		if( !keystate.ArrowRight.downTick || keystate.ArrowRight.downTick < tick ) {
			keystate.ArrowRight.downTick = tick + 250;
			biasx += 1;
		}
	}
	if( "ArrowUp" in keystate && keystate.ArrowUp.down ) {
		if( !keystate.ArrowUp.downTick || keystate.ArrowUp.downTick < tick ) {
			keystate.ArrowUp.downTick = tick + 250;
			biasy -= 1;
		}
	}
	if( "ArrowDown" in keystate && keystate.ArrowDown.down ) {
		if( !keystate.ArrowDown.downTick || keystate.ArrowDown.downTick < tick ) {
			keystate.ArrowDown.downTick = tick + 250;
			biasy += 1;
		}
	}

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
			sidePoints.forEach( (point,idx)=>{ 
					if( idx )
						ctx.lineTo( ofsx+cells_w*(cent.x + point[0]), ofsy+cells_h*(cent.y + point[1]) );
					else
						ctx.moveTo( ofsx+cells_w*(cent.x + point[0]), ofsy+cells_h*(cent.y  + point[1]) );
			} );
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
//const saveofsx = ofsx;
//const saveofsy = ofsy;

for( let z = 1; z < 4; z++ ) {
	//const ofsx = saveofsx - (( z < 0 )?10:0);
	//if( z != 0) continue;
	ctx.beginPath();
	ctx.strokeStyle = "#ffbbbb80";
	ctx.lineWidth = 1;
	ctx.font = "12px san-serif";
	for( let x = 0; x < cells_x; x++ ) {
		for( let y = 0; y < cells_y; y++ ) {
			const cent = toReal( x-3, y-3, z  );
			if( mod(z,3) == 2 ) ctx.fillStyle = z<0?"#700":"#F00";
			else if( mod(z,3) == 1 ) ctx.fillStyle = z<0?"#007":"#00F";
			else ctx.fillStyle = z<0?"#444":"#000";

			ctx.fillText( `${x+biasx},${y+biasy}\n${(x+biasx)>=0 && (y+biasy)>=0 ? data.grid[x+biasx][y+biasy].toFixed(2):0}`, (z<0?6:0)+ofsx+cells_w*(cent.x), ofsy+cells_h*(cent.y) );
			// tiny dot indicataing where the text refers...
			ctx.fillRect( ofsx+cells_w*(cent.x)-1, ofsy+cells_h*(cent.y)-1,3,3);

			// perpendiculars to sides...
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
	//if( z%2 === 0 ) {
	//	rx -= cells_w;
	//}
	
	const y = Math.floor( ry + 0.5 );
	if( y&1 )
		return {x:Math.floor(rx+1.0), y:Math.floor(ry+0.5)};
	else
		return {x:Math.floor(rx+0.5), y:Math.floor(ry+0.5)};
}


function toReal(hx,hy,hz) {
	const z = Math.floor( hz + 0.5 );
	const oddrow = Math.abs(hy)&1;
	const alt = mod(z,3) === 2;//(((-z)%3)==2);
	const alt1 = mod(z,3) === 1;//(((-z)%3)==2);
	if( alt )
	{
		const x = hx + (oddrow?-0.5:0 );
		const y = hy * 0.75 + 0.5;
		const z = hz * 0.75;
		return {x, y, z };	
	}else{
		//	let ty = ry; while( ty < 0 ) ty += 2;
		const x = hx + (oddrow?-0.5:0) + ( ( alt1)?0.5:0) ;
		const y = hy * 0.75 + (( alt1 )?+0.25:0);
		const z = hz * 0.75;
		return {x, y, z };	
	}

	
}

function mod(x,y) {
	const r = x%y;
	if( r < 0 ) return y+r;
	return r;	
}


function zzztoReal(hx,hy,hz) {
   // hx=0, hy=0 == rx=0, ry=0;
	// rx = hx + (((hy%2)-1)/2
	// hx + 1 = rx + 1;
	// rx += (((hy%2)-1)/2;

	const z = Math.floor( hz + 0.5 );

	const oddrow = Math.abs(hy)&1;
	const alt = mod(z,3) === 2;//(((-z)%3)==2);
	const alt1 = mod(z,3) === 1;//(((-z)%3)==2);

	if( alt )
	{
		const x = hx + (oddrow?-0.5:0 );
		const y = hy * 0.75 + 0.5;
		const z = hz * 0.75;

		return {x, y, z };	
	}else{
		//	let ty = ry; while( ty < 0 ) ty += 2;
		const x = hx + (oddrow?-0.5:0) + ( ( alt1)?0.5:0) ;
		const y = hy * 0.75 + (( alt1 )?+0.25:0);
		const z = hz * 0.75;

		
		return {x, y, z };	
	}

	
}

function zzzmod(x,y) {
	const r = x%y;
	if( r < 0 ) return y+r;
	return r;	
}

