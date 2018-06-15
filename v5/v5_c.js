
const UTILS = require('./utils');
const remap = UTILS.remap
const lerps = UTILS.lerps
const random = Math.random
const floor = Math.floor

function renderCircle(dist, rad) {
    const v = random()
    const hue = lerps(
        remap(dist,[0,rad],[0,1]),
        [
            // (325)/360,
            // (358)/360,
            // (360+15)/360,
            (360+120)/360,
            (360+180)/360,
        ]
    )
    const c = [
        //100.0	0.0	56.0
        //325degrees, 100,100
        //remap(325,[0,360],[0,1])+dist,
        hue,
        //remap(dist+remap(random(),[0,1],[0,0.3]),[0,0.5],[0.2,0.5]), // green hue
        remap(random(),[0,1],[0.6,0.8]), //random saturation
        remap(random(),[0,1],[0.7,0.8]), // fixed value
    ]
    return UTILS.HSVtoRGB(c)
}
function dist (x,y) {
    return Math.sqrt(x*x+y*y)
}

UTILS.save(UTILS.map(UTILS.gen(800,800), (cur,px,py,ix,iy) => {
    const d1 = Math.sin(iy*10)/10
    const d2 = Math.sin(ix*20)/10
    if(Math.abs(d1+0.2) > ix) {
        return renderCircle(d1+0.1,0.2)
    }
    return renderCircle(d2+0.1,0.2)
    const r = random()
    return [r,r,r]
}), 'v5_c.png')
