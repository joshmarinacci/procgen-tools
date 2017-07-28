const PImage = require('pureimage');
const fs = require('fs');
const SimplexNoise = require('simplex-noise');

let gen = new SimplexNoise();
function snoise(nx, ny) {
    // Rescale from -1.0:+1.0 to 0.0:1.0
    return gen.noise2D(nx, ny) / 2 + 0.5;
}


/*
generate multiple octaves of noise, each half the magnitude of the previous.
ex: 1/2, 1/4, 1/8, 1/16, etc.
 */
function octave_noise(nx,ny,octaves) {
    let val = 0;
    let ex = 2;
    for(let i=0; i<octaves; i++) {
        val += snoise(nx*ex,ny*ex)*(1/ex);
        ex = ex*2;
    }
    return val;
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
    const rows = [];
    for (let y = 0; y < height; y++) {
        const row = [];
        for(let x=0; x<width; x++) {
            const nx = x/width - 0.5, ny = y/height - 0.5;
            if(cb) {
                row[x] = cb(x,y,nx,ny);
            } else {
                row[x] = 0;
            }
        }
        rows[y] = row;
    }
    return rows;
}

function map_xy(rows,cb) {
    const width = rows[0].length;
    const height = rows.length;
    return rows.map((row,y)=>{
        return row.map((val,x) => {
            const nx = x/width - 0.5, ny = y/height - 0.5;
            return cb(val,x,y,nx,ny);
        })
    });
}

function for_xy(rows,cb) {
    const width = rows[0].length;
    const height = rows.length;
    rows.forEach((row,y)=>{
        row.forEach((val,x)=>{
            const nx = x/width - 0.5, ny = y/height - 0.5;
            cb(val,x,y,nx,ny);
        })
    })
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

/* write 2d data to a PNG file, assumes values from 0->1 */
function dataToPNG(noise,fname) {
    const h = noise.length;
    const w = noise[0].length;
    const img = PImage.make(w,h);
    const c = img.getContext('2d');
    c.fillStyle = 'white';
    c.fillRect(0, 0, 10, 10);


    for_xy(noise,(v,x,y)=>{
        let val = v * 255;
        img.setPixelRGBA_i(x,y,val,val,val,255);
    });

    PImage.encodePNGToStream(img, fs.createWriteStream(fname)).then(() => console.log("wrote",fname));
}

/* write 2d data to a PNG file, assumes each value is an rgb triplet */
function rgbToPNG(rgb,file_name) {
    const h = rgb.length;
    const w = rgb[0].length;
    const img = PImage.make(w,h);
    const c = img.getContext('2d');
    c.fillStyle = 'white';
    c.fillRect(0, 0, 10, 10);

    for_xy(rgb, (v,x,y)=>{
        img.setPixelRGBA_i(x, y, v.r*255, v.g*255, v.b*255, 255);
    });

    PImage.encodePNGToStream(img, fs.createWriteStream(file_name)).then(() => console.log("wrote",file_name));
}

function bandedNoiseTest() {
    let data = gen_xy(200,200);
    let noise = map_xy(data,(val,x,y,nx,ny)=>octave_noise(nx,ny,4));
    dataToPNG(noise,'band1.png');
}
bandedNoiseTest();


function simpleGradientTest(){
    const white = {r:1,g:1,b:1};
    const blue = {r:0,g:0,b:1};

    //make an empty data set
    let data = gen_xy(200,200);
    //fill with 4 octaves of noise
    let noise = map_xy(data,(val,x,y,nx,ny)=> octave_noise(nx,ny,4));
    //map to a simple white to blue gradient
    let rgb = map_xy(noise,(v)=>lerpRGB(v,white,blue));
    //save it
    rgbToPNG(rgb,"grad1.png");
}

simpleGradientTest();

function multiColorGradientTest() {
    //make an empty data set
    let data = gen_xy(200,200);
    //fill with six octaves of noise
    let noise = map_xy(data, (v,x,y,nx,ny) => octave_noise(nx,ny,6) );

    //map to a black to red to yellow to white gradient
    let rgb = map_xy(noise,(v)=>lerpRGBs(v, [
        {r:0, g:0, b:0},
        {r:0, g:0, b:0},
        {r:1, g:0, b:0},
        {r:1, g:1, b:0},
        {r:1, g:1, b:1},
        {r:1, g:1, b:1},
    ]));
    //save it
    rgbToPNG(rgb,"grad2.png");
}
multiColorGradientTest();

