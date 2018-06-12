//generate a noise field inside of a circle
//outside the circle is a very sparse noise field
//outside is black and white
//inside is a single hue with random saturation and value

const UTILS = require('./utils');
const random = Math.random
const floor = Math.floor
function remap(value, start, end) {
    const t = (value-start[0])/(start[1]-start[0])
    return t * (end[1]-end[0]) + end[0]
}

UTILS.save(UTILS.map(UTILS.gen(800,800), (cur,px,py,ix,iy) => {
    ix -= 0.5
    iy -= 0.5
    const dist = (Math.sqrt(ix*ix+iy*iy))
    if(dist > 0.3) {
        //random gray scale value
        const r = random()
        const v = (r>0.99)?remap(r,[0.99,1],[0,0.7]):0
        return [v,v,v]
    } else {
        const v = random()
        const c = [
            remap(dist+remap(random(),[0,1],[0,0.3]),[0,0.5],[0.2,0.5]), // green hue
            remap(random(),[0,1],[0.6,0.8]), //random saturation
            remap(random(),[0,1],[0.7,0.8]), // fixed value
        ]
        return UTILS.HSVtoRGB(c)
    }
}), 'v5_1.png')
