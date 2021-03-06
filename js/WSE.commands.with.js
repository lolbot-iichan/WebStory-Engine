/*<ON_DEPLOY_REMOVE>*/
/* global WSE */
/*
    Copyright (c) 2012 - 2014 The WebStory Engine Contributors
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
    
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.

    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.

    * Neither the name WebStory Engine nor the names of its contributors 
      may be used to endorse or promote products derived from this software 
      without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDERS BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
/*</ON_DEPLOY_REMOVE>*/
(function (out)
{
    "use strict";
    
    out.commands["with"] = function (command, interpreter)
    {
        var container = interpreter.runVars;
        var children = command.childNodes;
        var variableName = out.tools.getParsedAttribute(command, "var", interpreter);
        var i, numberOfChildren = children.length, current;
        
        for (i = 0; i < numberOfChildren; i += 1) {
            
            current = children[i];
            if (!current.tagName || !interpreter.checkIfvar(current) ||
                    (current.tagName !== "when" && current.tagName !== "else")) {
                continue;
            }
            
            if (current.tagName === "when" && ! current.hasAttribute("is")) {
                interpreter.bus.trigger("wse.interpreter.warning", {
                    message: "Element 'when' without a condition. Ignored.", command: command
                });
            }

            if (current.tagName === "else" && current.hasAttribute("is")) {
                interpreter.bus.trigger("wse.interpreter.warning", {
                    message: "Element 'else' with a condition. Ignored.", command: command
                });
            }

            if (current.tagName === "else" ||
                    current.tagName === "when" && current.hasAttribute("is") &&
                    out.tools.getParsedAttribute(current, "is") === container[variableName]) {
                
                interpreter.pushToCallStack();
                interpreter.currentCommands = current.childNodes;
                interpreter.scenePath.push(interpreter.index);
                interpreter.scenePath.push(i);
                interpreter.index = -1;
                interpreter.currentElement = -1;
                
                break;
            }
        }
        
        return {
            doNext: true
        };
    };
}(WSE));
