const PImage = require('pureimage');
const fs = require('fs');
const SimplexNoise = require('simplex-noise');

let gen = new SimplexNoise();
function snoise(nx, ny) {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return gen.noise2D(nx, ny) / 2 + 0.5;
}

function lerp(t,A,B) {
    return A + t*(B-A);
}

function lerps(t, values) {
    var band = Math.floor(t*(values.length-1));
    var band_size = 1/(values.length-1);
    var fract = (t-(band_size*band))/band_size;
    return lerp(fract,values[band],values[band+1]);
}

function lerpRGB(t, A, B) {
    return {
        r: lerp(t, A.r, B.r),
        g: lerp(t, A.g, B.g),
        b: lerp(t, A.b, B.b)
    }
}

function lerpRGBs(t, arr) {
    return {
        r: lerps(t, arr.map((C)=>C.r)),
        g: lerps(t, arr.map((C)=>C.g)),
        b: lerps(t, arr.map((C)=>C.b)),
    }
}

function clampToBands(v,bands) {
    return Math.round(v*bands)/bands;
}

/*
    calls the function cb on every element of a 2d array, passing in the x and y values,
    plus tx and ty, which go from 0 to 1 across the width and height, centered on the pixels.
 */
function gen_xy(width, height, cb) {
    let data = [];
    for(let x=0; x<width; x++) {
        for (let y = 0; y < height; y++) {
            const i = x+y*width;
            const nx = x/width - 0.5, ny = y/height - 0.5;
            data[i] = cb(x,y,nx,ny);
        }
    }
    return data;
}

function makeColorHSV(h,s,v) {
}

function makeColorRGB(r,g,b) {
}

function HSVtoRGB(hsv) {

}

/* generate a random number using a uniform distribution from min to max */
function rand(min,max) {}

/* make a new random number generator using a seed*/
function makeRandom(seed) {}

/* make an array of length 'length' filled random numbers from 0 to 1, */
function randArray(length) {
    let out = [];
    for(let i=0; i<length; i++) {
        out.push(Math.random());
    }
    return out;
}

/* write 1d noise to a bitmap, assumes noise is 100 samples, values from 0->1 */
function noise1DToBitmap(noise,w,h, fname) {
    const img = PImage.make(w,h);
    const c = img.getContext('2d');
    c.fillStyle = 'white';
    c.fillRect(0, 0, 10, 10);


    noise.forEach((v, i) => {
        let x = i % w;
        let y = Math.floor(i / w);
        let val = v * 255;
        img.setPixelRGBA_i(x, y, val, val, val, 255);
    });

    PImage.encodePNGToStream(img, fs.createWriteStream(fname)).then(() => console.log("wrote",fname));
}

function bandedNoiseTest() {
    // let noise = [];
    const width = 200, height = 200;
    let noise = gen_xy(width,height,(x,y,nx,ny)=>{
        return clampToBands(snoise(nx*2,ny*2)*0.5 + snoise(nx*4,ny*4)*0.25 + snoise(nx*8,ny*8)*0.125 + snoise(nx*16,ny*16)*(0.125/2),5);
    });
    noise1DToBitmap(noise,width,height,'band1.png');
}
bandedNoiseTest();

function rgb1DToBitmap(rgb,w,h,file_name) {
    const img = PImage.make(w,h);
    const c = img.getContext('2d');
    c.fillStyle = 'white';
    c.fillRect(0, 0, 10, 10);


    rgb.forEach((v, i) => {
        let x = i % w;
        let y = Math.floor(i / w);
        img.setPixelRGBA_i(x, y, v.r*255, v.g*255, v.b*255, 255);
    });

    PImage.encodePNGToStream(img, fs.createWriteStream(file_name)).then(() => console.log("wrote",file_name));

}


function simpleGradientTest(){
    const width = 200, height = 200;
    let noise = gen_xy(width,height,(x,y,nx,ny)=>{
        //generate noise with 4 octaves
        return (snoise(nx*2,ny*2)*0.5 + snoise(nx*4,ny*4)*0.25 + snoise(nx*8,ny*8)*0.125 + snoise(nx*16,ny*16)*(0.125/2));
    });

    //map to a simple white to blue gradient
    let rgb = noise.map((v)=>lerpRGB(v,{r:1,g:1,b:1},{r:0,g:0,b:1}));
    rgb1DToBitmap(rgb,width,height,"grad1.png");
}

simpleGradientTest();

function multiColorGradientTest() {
    const width = 100, height = 100;

    let noise = gen_xy(width,height,(x,y,nx,ny) => {
        //generate noise with 6 octaves
        return (snoise(nx*1,ny*1)*1/2
            + snoise(nx*2,ny*2)*1/4
            + snoise(nx*4,ny*4)*1/8
            + snoise(nx*8,ny*8)*1/16
            + snoise(nx*16,ny*16)*1/32
            + snoise(nx*32,ny*32)*1/64
        );
    });

    //black to red to yellow to white gradient
    let rgb = noise.map((v)=>lerpRGBs(v, [
        {r:0, g:0, b:0},
        {r:0, g:0, b:0},
        {r:1, g:0, b:0},
        {r:1, g:1, b:0},
        {r:1, g:1, b:1},
        {r:1, g:1, b:1},
    ]));
    rgb1DToBitmap(rgb,width,height,"grad2.png");
}
multiColorGradientTest();

