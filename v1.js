const SimplexNoise = require('simplex-noise');
const pureimage = require('pureimage');
const fs = require('fs');


function gen(width, height) {
    const rows = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for(let x=0; x<width; x++) {
            row[x] = 0;
        }
        rows[y] = row;
    }
    return rows;
}



function map(data,cb) {
    const width = data[0].length;
    const height = data.length;
    return data.map((row,py)=>{
        return row.map((val,px) => {
            const nx = px/width, ny = py/height;
            return cb(val,px,py,nx,ny);
        })
    })
}

function save(data,name) {
    const h = data.length;
    const w = data[0].length;
    const img = pureimage.make(w,h);
    const c = img.getContext('2d');
    c.fillStyle = 'white';
    c.fillRect(0, 0, 10, 10);

    map(data, (v,x,y)=>{
        img.setPixelRGBA_i(x, y, v.r*255, v.g*255, v.b*255, 255);
    });

    pureimage.encodePNGToStream(img, fs.createWriteStream(name)).then(() => console.log("wrote",name));

}

function demo1() {
    const img = gen(100,100)
    const img2 = map(img,(cur, px,py,ix,iy)=>{
        return { r:1, g:0, b:0}
    })
    save(img2,'demo1.png')
}

//demo1()
function demo2() {
    save(map(gen(100,100), (cur, px,py,ix,iy) => ({r:1,g:0,b:0})), 'demo2.png')
}




let simplex = new SimplexNoise();
function noise(nx, ny) {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return simplex.noise2D(nx, ny) / 2 + 0.5;
}

function octave(nx,ny,octaves) {
    let val = 0;
    let freq = 1;
    let max = 0;
    let amp = 1;
    for(let i=0; i<octaves; i++) {
        val += noise(nx*freq,ny*freq)*amp;
        max += amp;
        amp /= 2;
        freq  *= 2;
    }
    return val/max;
}


function noiseTest1() {
    save(map(gen(100,100), (cur,px,py,ix,iy) => {
        const v = octave(ix,iy,8)
        return {r:v,g:v,b:v}
    }), 'noise1.png')
}


noiseTest1()