const PImage = require('pureimage');
const fs = require('fs');
const SimplexNoise = require('simplex-noise');

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

const min = Math.min;

/* smooth noise array with the minimum of adjacent values
 * returns array one element shorter than noise
 * */
function adjacent_min(noise) {
    let out = [];
    for(let i=0; i<noise.length; i++) {
        out.push(min(noise[i],noise[i+1]));
    }
    return out;
}

function smoother(noise) {
    let out = [];
    for(let i=0; i<noise.length; i++) {
        out.push((noise[i]+noise[i+1])/2);
    }
    return out;
}
function rougher(noise) {
    let out = [];
    for(let i=0; i<noise.length; i++) {
        out.push((noise[i]-noise[i+1])/2);
    }
    return out;
}

/* write 1d noise to a bitmap, assumes noise is 100 samples, values from 0->1 */
function noise1DToBitmap(noise,w,h) {
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

    PImage.encodePNGToStream(img, fs.createWriteStream('out.png')).then(() => console.log("done"));
}



/*
{
    let noise = randArray(10 * 10+1);
    noise = rougher(noise);
    noise1DToBitmap(noise);
}
*/

function scaleFrom(value, oldmin, oldmax, newmin, newmax) {
    let t =  (value-oldmin) / (oldmax-oldmin)
    t = t*(newmax-newmin) + newmin;
     return t;
}

function clampToBands(v,bands) {
    return Math.round(v*bands)/bands;
}

function noiseTest() {
    let gen = new SimplexNoise();
    function snoise(nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return gen.noise2D(nx, ny) / 2 + 0.5;
    }

    function trigNoise(x,y) {
        return scaleFrom(Math.cos(x/4.0)+Math.sin(y/4.0),-2,2,0,1)
    }
    let noise = [];
    const width = 200, height = 200;
    for(let x=0; x<width; x++) {
        for(let y = 0; y<height; y++) {
            let i = x+y*width;
            // noise[i]
            //     = 1.0 * trigNoise(1*x,1*y)
            //     + 0.5 * trigNoise(2*x,2*y)
            // noise[i] = scaleFrom(noise[i],0,1,0,1);
            var nx = x/width - 0.5, ny = y/height - 0.5;

            noise[i] = (snoise(nx*2,ny*2)*0.5 + snoise(nx*4,ny*4)*0.25 + snoise(nx*8,ny*8)*0.125 + snoise(nx*16,ny*16)*(0.125/2));
            noise[i] = clampToBands(noise[i],5);
        }
    }
    noise1DToBitmap(noise,width,height);
}

// noiseTest();

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

function lerp(t,A,B) {
    return A + t*(B-A);
}

function simpleGradientTest(){

    let gen = new SimplexNoise();
    function snoise(nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return gen.noise2D(nx, ny) / 2 + 0.5;
    }
    let noise = [];
    const width = 200, height = 200;
    for(let x=0; x<width; x++) {
        for(let y = 0; y<height; y++) {
            const i = x+y*width;
            //get the center of each pixel
            const nx = x/width - 0.5, ny = y/height - 0.5;
            //generate noise with 4 octaves
            noise[i] = (snoise(nx*2,ny*2)*0.5 + snoise(nx*4,ny*4)*0.25 + snoise(nx*8,ny*8)*0.125 + snoise(nx*16,ny*16)*(0.125/2));
            // noise[i] = clampToBands(noise[i],5);
        }
    }

    function lerpRGB(t, A, B) {
        return {
            r: lerp(t, A.r, B.r),
            g: lerp(t, A.g, B.g),
            b: lerp(t, A.b, B.b)
        }
    }
    const black = {r:0, g:0, b:0};
    const blue = {r:0, g:0, b:1};
    const red = {r:1, g:0, b:0};
    const white = {r:1, g:1, b:1};
    let rgb = noise.map((v)=>lerpRGB(v,white,blue));
    rgb1DToBitmap(rgb,width,height,"out1.png");


    //apply a black to orangey-red gradient
    // mapGrayscaleToRGB(noise)
}

// simpleGradientTest();

function lerps(t, arr) {
    var section = Math.floor(t*(arr.length-1));
    var a = arr[section];
    var b = arr[section+1];
    var section_length = 1/(arr.length-1);
    var fract = (t-(section_length*section))/section_length;
    var val = lerp(fract,a,b);
    // console.log("t",t.toFixed(2),
    //     'sect',section, 'sectl',section_length.toFixed(2),'t`',fract.toFixed(2),
    //     'a',a,'b',b,'v',val.toFixed(2));
    // console.log(val.toFixed(2));
    return val;
}


function multiColorGradientTest() {
    let gen = new SimplexNoise();
    function snoise(nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return gen.noise2D(nx, ny) / 2 + 0.5;
    }
    let noise = [];
    const width = 100, height = 100;
    for(let x=0; x<width; x++) {
        for(let y = 0; y<height; y++) {
            const i = x+y*width;
            //get the center of each pixel
            const nx = x/width - 0.5, ny = y/height - 0.5;
            //generate noise with 4 octaves
            noise[i] = (snoise(nx*2,ny*2)*0.5 + snoise(nx*4,ny*4)*0.25 + snoise(nx*8,ny*8)*0.125 + snoise(nx*16,ny*16)*(0.125/2));
            // noise[i] = clampToBands(noise[i],5);
        }
    }

    const red = {r:1, g:0, b:0};
    const yellow = {r:1, g:1, b:0};
    const green= {r:0, g:1, b:0};

    const black = {r:0, g:0, b:0};
    const blue = {r:0, g:0, b:1};
    const white = {r:1, g:1, b:1};
    function lerpRGBs(t, arr) {
        return {
            r: lerps(t, arr.map((C)=>C.r)),
            g: lerps(t, arr.map((C)=>C.g)),
            b: lerps(t, arr.map((C)=>C.b)),
        }
    }
    let rgb = noise.map((v)=>lerpRGBs(v, [
        {r:0, g:0, b:0},
        {r:0, g:0, b:0},
        {r:1, g:0, b:0},
        {r:1, g:1, b:0},
        {r:1, g:1, b:1},
        {r:1, g:1, b:1},
    ]));
    rgb1DToBitmap(rgb,width,height,"out2.png");
    //apply a four stop gradient.  black to dark red to orange to yellow to white
}
multiColorGradientTest();

function colorTests() {
    for(let t = 0; t<=1.0; t+=0.05) {
        lerps(t, [0,1,0,1]);
    }
}
colorTests();