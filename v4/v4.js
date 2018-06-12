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
        img.setPixelRGBA_i(x, y, v[0]*255, v[1]*255, v[2]*255, 255);
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


function lerp (t,A,B) {
    return A+t*(B-A)
}
function lerps(t, values) {
    var band = Math.floor(t*(values.length-1));
    if(t === 1.0) band = (values.length-1)-1
    var band_size = 1/(values.length-1);
    var fract = (t-(band_size*band))/band_size;
    return lerp(fract,values[band],values[band+1]);
}
function lerpColors(t, arr) {
    //get the first color so we know it has 3 elements
    const first = arr[0]
    return first.map((c,comp) => {
        return lerps(t, arr.map(color=>color[comp]))
    })
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
    let h = hsv[0];
    let s = hsv[1];
    let v = hsv[2];
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
        return [r,g,b]
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

function remap(value, start, end) {
    const t = (value-start[0])/(start[1]-start[0])
    return t * (end[1]-end[0]) + end[0]
}


const red   = [1,0,0]
const green = [0,1,0]
const white = [1,1,1]
const black = [0,0,0]

const band1 = [red,red,green,green,white,white]
const floor = Math.floor

save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const c1 = [0,1,1]
    const c2 = [c1[0],c1[1]/2,c1[2]/2]
    const band = [c1,c2]
    return band[floor(ix*band.length)]
}), 'v4_1.png')


function darker(hsv) {
    return [hsv[0], hsv[1], hsv[2]-0.1]
}
save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = []
    let color = [0,1,1]
    colors.push(color)
    for(let n=0; n<10; n++) {
        color = darker(color)
        colors.push(color)
    }
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_2.png')

function complimentary(hsv) {
    return [hsv[0]+0.5,hsv[1],hsv[2]]
}

save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = []
    let color = [0,1,1]
    colors.push(color)
    colors.push(complimentary(color))
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_3a.png')

save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = []
    let color = [0.2,1,1]
    colors.push(color)
    colors.push(complimentary(color))
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_3b.png')


save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = []
    let color = [0.3,1,1]
    colors.push(color)
    colors.push(complimentary(color))
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_3c.png')


function triadic(base) {
    return [
        [base[0]+0.000,base[1],base[2]],
        [base[0]+1/3,base[1],base[2]],
        [base[0]+2/3,base[1],base[2]],
    ]
}
save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = triadic([0.3,1,1])
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_4a.png')


function analagous(base) {
    return [
        [base[0]+0.000,base[1],base[2]],
        [base[0]+1/12,base[1],base[2]],
        [base[0]-1/12+1,base[1],base[2]],
    ]
}


save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = analagous([0.3,1,1])
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_4b.png')

save(map(gen(200,200), (cur,px,py,ix,iy) => {
    const colors = analagous([0.3,1,1])
    colors[1] = darker(colors[1])
    colors[2] = darker(colors[2])
    const band = colors.map(c => HSVtoRGB(c))
    return band[floor(ix*band.length)]
}), 'v4_4c.png')


//rotate hue slightly by a set amount, then pick a random
//saturation and value

function add(c1, c2) {
    return [c1[0]+c2[0], c1[1]+c2[1], c1[2]+c2[2]]
}

function wrap(v) {
    if(v <0) return -v
    if(v >1) return 2-v
    return v
}

function generateRandomGradient(count) {
    const random = Math.random
    const colors = []
    let color = [0.3,0.5,1]
    for(let i=0; i<20; i++) {
        //rotate the hue by 0.05
        color = add(color,[0.02,0,0])
        //adjust the staturation by a random amount
        color = add(color,[0,+random(),+random()/2])

        //flip it if outside the range
        color[1] = wrap(color[1])
        color[2] = wrap(color[2])
        colors.push(color)
    }
    const band = colors.map(c => HSVtoRGB(c))
    save(map(gen(200,200), (cur,px,py,ix,iy) => {
        return band[floor(ix*band.length)]
    }), `v4_5_${count}.png`)
}
for(let i=0; i<10; i++) generateRandomGradient(i)
