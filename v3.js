const SimplexNoise = require('simplex-noise');
const pureimage = require('pureimage');
const fs = require('fs');
const colorsys = require('colorsys')


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



//lerp from 0 to 360 in HSV
//lerp across a sin wave
//lerp across a noise field
//threshold, show solid color below 0.5 and noise above 0.5

function lerp(t,A,B) { return A + t*(B-A) }


//lerp from 0 to 1. black to white
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    const v = lerp(ix,0,1)
    return {r:v,g:v,b:v}
}), 'v3_1.png')

function lerps(t, values) {
    var band = Math.floor(t*(values.length-1));
    if(t === 1.0) band = (values.length-1)-1
    var band_size = 1/(values.length-1);
    var fract = (t-(band_size*band))/band_size;
    return lerp(fract,values[band],values[band+1]);
}

//lerp from 0 to 1 to 0 to 1 to 0
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    const v = lerps(ix,[0,1,0,1,0])
    return {r:v,g:v,b:v}
}), 'v3_2.png')


function lerpRGBs(t, arr) {
    return {
        r: lerps(t, arr.map((C)=>C.r)),
        g: lerps(t, arr.map((C)=>C.g)),
        b: lerps(t, arr.map((C)=>C.b)),
    }
}

const red = {r:1, g:0, b:0}
const green = {r:0, g:1, b:0}
const black = {r:0, g:0, b:0}

//lerp from red to green
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    const c = lerpRGBs(ix,[red,green, black])
    return c
}), 'v3_3b.png')


function lerpHSVs(t, arr) {
    return {
        h: lerps(t, arr.map((C)=>C.h)),
        s: lerps(t, arr.map((C)=>C.s)),
        v: lerps(t, arr.map((C)=>C.v)),
    }
}

//http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function HSVtoRGB(hsv) {
    /**
     * Converts an HSV color value to RGB. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes h, s, and v are contained in the set [0, 1] and
     * returns r, g, and b in the set [0, 1].
     *
     * @param   Number  h       The hue
     * @param   Number  s       The saturation
     * @param   Number  v       The value
     * @return  Array           The RGB representation
     */
    let h = hsv.h;
    let s = hsv.s;
    let v = hsv.v;
        var r, g, b;
        var i = Math.floor(h * 6);
        var f = h * 6 - i;
        var p = v * (1 - s);
        var q = v * (1 - f * s);
        var t = v * (1 - (1 - f) * s);
        switch(i % 6){
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        return {r:r, g:g, b:b}
}

// http://axonflux.com/handy-rgb-to-hsl-and-rgb-to-hsv-color-model-c
function RGBtoHSV(rgb) {
    /**
     * Converts an RGB color value to HSV. Conversion formula
     * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
     * Assumes r, g, and b are contained in the set [0, 255] and
     * returns h, s, and v in the set [0, 1].
     *
     * @param   Number  r       The red color value
     * @param   Number  g       The green color value
     * @param   Number  b       The blue color value
     * @return  Array           The HSV representation
     */
     //function rgbToHsv(r, g, b){
    let r = rgb.r
    let g = rgb.g
    let b = rgb.b;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;

    var d = max - min;
    s = max == 0 ? 0 : d / max;

    if(max == min){
        h = 0; // achromatic
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }

    return {h:h, s:s, v:v}
}


//lerp from red to green in HSV
// save(map(gen(100,100), (cur,px,py,ix,iy) => {
//     const c = lerpHSVs(ix,[RGBtoHSV(red),RGBtoHSV(green)])
//     return HSVtoRGB(c)
// }), 'v3_4.png')



//lerp two colors across some noise2D
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,8)*4 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    return lerpRGBs(v,[red,green])
}), 'v3_4.png')


// use threshold on noise. red or green
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,8)*4 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    if(v < 0.5) return red
    return green
    // return lerpRGBs(v,[red,green])
}), 'v3_5.png')

// use threshold on noise. red or green
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,8)*4 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    if(v < 0.4) {
        v = 0.1
    } else if(v >= 0.6) {
        v = 0.99
    } else {
        v = (v-0.4)*5 // map [0.4,0.6] to [0-1]
    }
    return lerpRGBs(v,[red,green])
}), 'v3_6.png')


// use threshold on noise. v<0.5 => red, v >=0.5 => noise red
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,8)*4 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*4) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    if(v < 0.5) {
        v = 0
    } else {
        v = (v-0.5)*2 // map [0.4,0.6] to [0-1]
    }
    return lerpRGBs(v,[red,green])
}), 'v3_7.png')

const seaBlue = {r:0, g:0.3, b:0.9}
const brown = {r:0.1, g:0.7, b: 0.3}

// use threshold on noise. v<0.5 => red, v >=0.5 => noise red
save(map(gen(100,100), (cur,px,py,ix,iy) => {
    let theta = ix*2*pi // convert pixels to radians
    theta += octave(ix,iy,30)*5 //displace theta by the noise, increase the 4 factor to make the noise stronger
    const vx = sin(theta*2) //calc sin. increase the 4 factor to make more vertical lines
    let v = (1 + vx)/2 //map [-1,1] to [0-1]
    if(v < 0.5) {
        v = 0
    } else {
        v = (v-0.5)*2 // map [0.4,0.6] to [0-1]
    }
    return lerpRGBs(v,[seaBlue,brown])
}), 'v3_8.png')



const white = {r:1, g:1, b:1}
// use threshold on noise. v<0.5 => red, v >=0.5 => noise red
save(map(gen(600,600), (cur,px,py,ix,iy) => {
    let theta1 = ix*2*pi // convert pixels to radians
    let theta2 = iy*2*pi // pixels to radians
    const vn = octave(ix,iy,30)
    let v1 = sin(theta1*3)
    let v2 = sin(theta2*4)
    v1 = (1 + v1)/2 //map [-1,1] to [0-1]
    v2 = (1 + v2)/2 //map [-1,1] to [0-1]
    if(vn < 0.5) {
        return lerpRGBs(v1,[red,green])
    } else {
        return lerpRGBs(v2,[black,white])
    }
}), 'v3_9.png')
