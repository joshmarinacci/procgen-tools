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


const sin = (v) => Math.sin(v)
const pi = Math.PI

save(map(gen(100,100), (cur,px,py,ix,iy) => {
    const theta = ix*2*pi
    const vx = sin(theta)
    const v = (1 + vx)/2
    return {r:v,g:v,b:v}
}), 'v2_1.png')

save(map(gen(100,100), (cur,px,py,ix,iy) => {
    const theta = ix*2*pi
    const vx = sin(theta*4)
    const v = (1 + vx)/2
    return {r:v,g:v,b:v}
}), 'v2_2.png')

save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,2)*1 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    return {r:v,g:v,b:v} //return grayscale
}), 'v2_3.png')

save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,8)*4 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    return {r:v,g:v,b:v} //return grayscale
}), 'v2_4.png')
