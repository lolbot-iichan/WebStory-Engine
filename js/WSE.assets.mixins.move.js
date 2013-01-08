(function (out)
{
    out.assets.mixins.move = function (command, args)
    {
        var x, y, z, element, self,
        wait, xUnit, yUnit, duration, easingType, easing,
        waitX, waitY, waitZ, isAnimation;

        self = this;
        element = document.getElementById(this.cssid);
        x = command.getAttribute("x");
        y = command.getAttribute("y");
        z = command.getAttribute("z");
        duration = command.getAttribute("duration") || 500;
        easingType = command.getAttribute("easing") || "sineEaseOut";
        easing = (typeof out.fx.easing[easingType] !== null) ? out.fx.easing[easingType] : out.fx.easing.sineEaseOut;
        isAnimation = args.animation === true ? true : false;

        if (x !== null)
        {
            xUnit = x.replace(/^(-){0,1}[0-9]*/, "");
            x = parseInt(x, 10);
        }

        if (y !== null)
        {
            yUnit = y.replace(/^(-){0,1}[0-9]*/, "");
            y = parseInt(y, 10);
        }

        wait = command.getAttribute("wait") === "yes" ? true : false;
        waitX = false;
        waitY = false;
        waitZ = false;

        if (x === null && y === null && z === null)
        {
            this.bus.trigger("wse.interpreter.warning",
            {
                element: command,
                message: "Can't apply action 'move' to asset '" + this.name + "' because no x, y or z position has been supplied."
            });
        }

        if (x !== null)
        {
            if (!isAnimation)
            {
                self.interpreter.waitCounter += 1;
            }

            out.fx.transform(

            function (v)
            {
                element.style.left = v + xUnit;
            },
            element.offsetLeft,
            x,
            {
                onFinish: !isAnimation ? function ()
                {
                    self.interpreter.waitCounter -= 1;
                } : null,
                duration: duration,
                easing: easing
            });
        }

        if (y !== null)
        {
            if (!isAnimation)
            {
                self.interpreter.waitCounter += 1;
            }

            out.fx.transform(

            function (v)
            {
                element.style.top = v + yUnit;
            },
            element.offsetTop,
            y,
            {
                onFinish: !isAnimation ? function ()
                {
                    self.interpreter.waitCounter -= 1;
                } : null,
                duration: duration,
                easing: easing
            });
        }

        if (z !== null)
        {
            if (!isAnimation)
            {
                self.interpreter.waitCounter += 1;
            }

            out.fx.transform(

            function (v)
            {
                element.style.zIndex = v;
            },
            element.style.zIndex || 0,
            parseInt(z, 10),
            {
                onFinish: !isAnimation ? function ()
                {
                    self.interpreter.waitCounter -= 1;
                } : null,
                duration: duration,
                easing: easing
            });
        }

        this.bus.trigger("wse.assets.mixins.move", this);

        return {
            doNext: true
        };
    };    
}(WSE));