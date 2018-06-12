const pureimage = require('pureimage');
const fs = require('fs');

module.exports = {
    gen: function(width, height) {
        const rows = [];
        for (let y = 0; y < height; y++) {
            const row = [];
            for(let x=0; x<width; x++) {
                row[x] = 0;
            }
            rows[y] = row;
        }
        return rows;
    },
    map: function(data,cb) {
        const width = data[0].length;
        const height = data.length;
        return data.map((row,py)=>{
            return row.map((val,px) => {
                const nx = px/width, ny = py/height;
                return cb(val,px,py,nx,ny);
            })
        })
    },
    save: function(data,name) {
        const h = data.length;
        const w = data[0].length;
        const img = pureimage.make(w,h);
        const c = img.getContext('2d');
        c.fillStyle = 'white';
        c.fillRect(0, 0, 10, 10);

        this.map(data, (v,x,y)=>{
            img.setPixelRGBA_i(x, y, v[0]*255, v[1]*255, v[2]*255, 255);
        });

        pureimage.encodePNGToStream(img, fs.createWriteStream(name)).then(() => console.log("wrote",name));

    },

    HSVtoRGB :function(hsv) {
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

}
