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

{
    var gen = new SimplexNoise();
    function snoise(nx, ny) {
        // Rescale from -1.0:+1.0 to 0.0:1.0
        return gen.noise2D(nx, ny) / 2 + 0.5;
    }

    function trigNoise(x,y) {
        return scaleFrom(Math.cos(x/4.0)+Math.sin(y/4.0),-2,2,0,1)
    }
    function clampToBands(v,bands) {
        return Math.round(v*bands)/bands;
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

