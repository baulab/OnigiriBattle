(function (interval) {
    var keyboard = {};

    function keyup(event) {
        if(keyboard[event.keyCode] && keyboard[event.keyCode].pressed){
            keyboard[event.keyCode].pressed = false;
        }
    }

    function keydown(event) {
        var keyCode = event.keyCode;
        var key = keyboard[keyCode];
        
        switch(keyCode){
        case 32:
        case 37:
        case 38:
        case 39:
        case 40:
            if (key) {
                if (!key.start)
                    key.start = key.timer.start();
                key.pressed = true;
            } else {
                var timer = new DeltaTimer(function (time) {
                    if (key.pressed) {
                        var event = document.createEvent("Event");
                        event.initEvent("keypressed", true, true);
                        event.time = time - key.start;
                        event.keyCode = keyCode;
                        window.dispatchEvent(event);
                    } else {
                        key.start = 0;
                        timer.stop();
                    }
                }, interval);

                key = keyboard[keyCode] = {
                    pressed: true,
                    timer: timer
                };

                key.start = timer.start();
            }
            break;
        default:
            break;
        }
    }
    
    window.addEventListener("keyup", keyup, false);
    window.addEventListener("keydown", keydown, false);
    
    function DeltaTimer(render, interval) {
        function start() {
            timeout = setTimeout(loop, 0);
            lastTime = Date.now();
            return lastTime;
        }

        function stop() {
            clearTimeout(timeout);
            return lastTime;
        }

        function loop() {
            var thisTime = Date.now();
            var deltaTime = thisTime - lastTime;
            var delay = Math.max(interval - deltaTime, 0);
            timeout = setTimeout(loop, delay);
            lastTime = thisTime + delay;
            render(thisTime);
        }
        
        var timeout;
        var lastTime;

        this.start = start;
        this.stop = stop;
    }
})(20);
