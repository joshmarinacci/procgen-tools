
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
            325/360,
            358/360,
            (360+15)/360,
            (360+28)/360
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


    const d1 = Math.sin(iy*30)/10
    if(d1+0.5 > ix) {
        return renderCircle(d1,0.1)
    }
    // return [0,1,0]
    return renderCircle(d1,0.5)
    // const r = random()
    // const v = (r>0.99)?remap(r,[0.99,1],[0,0.7]):0
    // return [v,v,v]
}), 'v5_b.png')
