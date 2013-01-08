(function (out)
{
    out.assets.Textbox = function (asset, interpreter)
    {

        if (!(this instanceof out.assets.Textbox))
        {
            return new out.assets.Textbox(asset, interpreter);
        }

        var element, nameElement, textElement, cssid, x, y, width, height;

        this.interpreter = interpreter;
        this.name = asset.getAttribute("name");
        this.stage = interpreter.stage;
        this.bus = interpreter.bus;
        this.type = asset.getAttribute("behaviour") || "adv";
        this.z = asset.getAttribute("z") || 5000;
        this.showNames = asset.getAttribute("names") === "yes" ? true : false;
        this.nltobr = asset.getAttribute("nltobr") === "true" ? true : false;
        this.id = out.tools.getUniqueId();
        this.cssid = "wse_textbox_" + this.id;
        this.effectType = asset.getAttribute("effect") || "typewriter";
        this.speed = asset.getAttribute("speed") || 20;

        if (this.type === "nvl")
        {
            this.showNames = false;
        }

        element = document.createElement("div");
        nameElement = document.createElement("div");
        textElement = document.createElement("div");

        element.setAttribute("class", "textbox");
        textElement.setAttribute("class", "text");
        nameElement.setAttribute("class", "name");

        cssid = asset.getAttribute("cssid") || this.cssid;
        element.setAttribute("id", cssid);
        this.cssid = cssid;

        x = asset.getAttribute("x");
        if (x)
        {
            element.style.left = x;
        }

        y = asset.getAttribute("y");
        if (y)
        {
            element.style.top = y;
        }

        element.style.zIndex = this.z;

        width = asset.getAttribute("width");
        if (width)
        {
            element.style.width = width;
        }

        height = asset.getAttribute("height");
        if (height)
        {
            element.style.height = height;
        }

        element.appendChild(nameElement);
        element.appendChild(textElement);
        this.stage.appendChild(element);

        if (this.showNames === false)
        {
            nameElement.style.display = "none";
        }

        nameElement.setAttribute("id", this.cssid + "_name");
        textElement.setAttribute("id", this.cssid + "_text");

        this.nameElement = this.cssid + "_name";
        this.textElement = this.cssid + "_text";

        element.style.opacity = 0;

        this.bus.trigger("wse.assets.textbox.constructor", this);
    };

    out.assets.Textbox.prototype.show = out.assets.mixins.show;
    out.assets.Textbox.prototype.hide = out.assets.mixins.hide;
    out.assets.Textbox.prototype.move = out.assets.mixins.move;
    out.assets.Textbox.prototype.flash = out.assets.mixins.flash;
    out.assets.Textbox.prototype.flicker = out.assets.mixins.flicker;

    out.assets.Textbox.prototype.put = function (text, name)
    {
        var textElement, nameElement, namePart, self;
        
        name = name || null;

        self = this;
        textElement = document.getElementById(this.textElement);
        nameElement = document.getElementById(this.nameElement);

        text = out.tools.replaceVariables(text, this.interpreter);
        text = out.tools.textToHtml(text, this.nltobr);

        self.interpreter.waitCounter += 1;

        if (this.type === "adv" && this.effectType !== "typewriter")
        {
            self.interpreter.waitCounter += 1;
            
            (function ()
            {
                var valFn, finishFn, options;
                
                valFn = function (v)
                {
                    textElement.style.opacity = v;
                };
                
                finishFn = function ()
                {
                    self.interpreter.waitCounter -= 1;
                };
                
                options = {
                    duration: 50,
                    onFinish: finishFn
                };
                
                out.fx.transform(valFn, 1, 0, options);
            }());
            
            textElement.innerHTML = "";
        }

        namePart = "";
        if (this.showNames === false && !(!name))
        {
            namePart = name + ": ";
        }

        if (name === null)
        {
            name = "";
        }

        if (this.type === "adv")
        {
            if (this.effectType === "typewriter")
            {
                textElement.innerHTML = "";
                (function ()
                {
                    var content, cancelFn, charCount, curCharIndex, dur, isCanceled;
                    var elapsed, timePool, runFn;

                    self.interpreter.waitCounter += 1;

                    isCanceled = false;
                    content = namePart + text;
                    curCharIndex = 0;
                    charCount = content.length;

                    //console.log("dur: " + dur + "; speed: " + self.speed);

                    cancelFn = function (stopObj)
                    {
                        self.interpreter.bus.unsubscribe(cancelFn, "wse.interpreter.next.user");

                        if (isCanceled === true)
                        {
                            return;
                        }

                        self.interpreter.waitCounter -= 1;
                        runFn = function () {};
                        textElement.innerHTML = content;
                        isCanceled = true;
                        stopObj.stop = true;
                    };

                    self.interpreter.bus.subscribe(cancelFn, "wse.interpreter.next.user")

                    runFn = function ()
                    {
                        if (isCanceled === true)
                        {
                            return;
                        }

                        if (curCharIndex >= charCount)
                        {
                            textElement.innerHTML = content;
                            self.interpreter.waitCounter -= 1;
                            self.interpreter.bus.unsubscribe(cancelFn, "wse.interpreter.next.user");
                            return;
                        }

                        var curChar = content.charAt(curCharIndex);

                        //console.log("curChar is:", curChar);

                        textElement.innerHTML += curChar;
                        curCharIndex += 1;

                        setTimeout(runFn, self.speed);
                    };

                    runFn();
                }());
            }
            else
            {
                self.interpreter.waitCounter += 1;
                setTimeout(

                function ()
                {
                    textElement.innerHTML += namePart + text;
                    nameElement.innerHTML = name;
                    out.fx.transform(

                    function (v)
                    {
                        textElement.style.opacity = v;
                    },
                    0,
                    1,
                    {
                        duration: 50,
                        onFinish: function ()
                        {
                            self.interpreter.waitCounter -= 1;
                        }
                    });
                },
                50);
            }
        }
        else
        {
            self.interpreter.waitCounter += 1;
            setTimeout(

            function ()
            {
                textElement.innerHTML += "<p>" + namePart + text + "</p>";
                nameElement.innerHTML = name;
                self.interpreter.waitCounter -= 1;
            },
            200);
        }

        this.bus.trigger("wse.assets.textbox.put", this, false);
        self.interpreter.waitCounter -= 1;

        return {
            doNext: false
        };
    };

    out.assets.Textbox.prototype.clear = function ()
    {
        document.getElementById(this.textElement).innerHTML = "";
        document.getElementById(this.nameElement).innerHTML = "";
        this.bus.trigger("wse.assets.textbox.clear", this);
        return {
            doNext: true
        };
    };

    out.assets.Textbox.prototype.save = function (obj)
    {
        obj[this.id] = {
            assetType: "Textbox",
            type: this.type,
            showNames: this.showNames,
            nltobr: this.nltobr,
            cssid: this.cssid,
            nameElement: this.nameElement,
            textElement: this.textElement,
            z: this.z
        };
    };

    out.assets.Textbox.prototype.restore = function (obj)
    {
        var save = obj[this.id];
        
        this.type = save.type;
        this.showNames = save.showNames;
        this.nltobr = save.nltobr;
        this.cssid = save.cssid;
        this.nameElement = save.nameElement;
        this.textElement = save.textElement;
        this.z = save.z;

        document.getElementById(this.cssid).style.zIndex = this.z;
    };    
}(WSE));