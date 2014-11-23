var wi = wi || {};

wi.IE = function()
{
    return ((navigator.appName == 'Microsoft Internet Explorer') || ((navigator.appName == 'Netscape') && (new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent) != null))); 
};

wi.isArray = ('isArray' in Array) ? Array.isArray : function (value) {
    return Object.prototype.toString.call(value) === '[object Array]';
};

wi.getURLParamValue = function(nameArg)
{
    var name = nameArg.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec(window.location.href);
    if( results == null )
        return "";
    else
        return results[1];
};

wi.getEvent = function(event)
{
    return (window.event == undefined) ? event : window.event;
}

wi.getKeyCode = function(event)
{
    return (typeof event.which === "number") ? event.which : event.keyCode;
}

wi.getRandom = function (from,to)
{
    return Math.floor((Math.random()*(to-from+1))+from);
};


wi.elem = function (id)
{
    return document.getElementById(id);
};


wi.body = function ()
{
    return document.getElementsByTagName("body")[0];
};

wi.deleteElementById = function(id)
{
    var element = document.getElementById(id);

    if (element)
        if (element.parentNode)
            element.parentNode.removeChild(element);
};

wi.createElement = function(type, arg2, arg3)
{
    var theNode = undefined;
    var key="";
    var i=0;
    var properties = undefined;
    var children = undefined;

    if (type)
    {
        if (wi.isArray(arg3))
        {
            properties = arg2;
            children = arg3;
        }
        else
            if (wi.isArray(arg2))
                children = arg2;
            else
                properties = arg2;

        theNode = document.createElement(type);

        if (theNode)
        {
            if (properties)
                for (key in properties)
                    theNode[key] = properties[key];

            if (children)
                if (typeof children[0] === "string")
                    theNode.appendChild(wi.createElement(children[0], children[1], children[2]));
                else
                    wi.forEach(
                        children,
                        function(elem){
                            if (wi.isArray(elem))
                                theNode.appendChild(wi.createElement(elem[0], elem[1], elem[2]));
                            else
                                theNode.appendChild(elem);
                            }
                        );
        }
    }

    return theNode;
}

if (document.getElementsByClassName)
{
    wi.getElementsByClassName = function(rootElem, className)
    {
        return rootElem.getElementsByClassName(className);
    };
}
else
{
    wi.getElementsByClassName = function(rootElem, className)
    {
        var i = 0;
        var j = 0;
        var a = [];
        var els = rootElem.getElementsByTagName("*");
        wi.forEach(
            els,
            function(elem){
                if (wi.hasClass(elem, className))
                    a.push(elem);
                }
            )
        return a;
    };
}

wi.getAllElements = function(rootElem)
{
    if (rootElem)
        return rootElem.getElementsByTagName("*");
    else
        return false;
};

wi.forEach = function(array, loopFun, breakable)
{
    var i=0, element;
    if (breakable)
    {
        while (element = array[i])
            if (loopFun(element,i++))
                return true;
    }
    else
        while (element = array[i])
            loopFun(element,i++);

    return false;
};

wi.clearEnabled = true;

wi.clear_console = function()
{
    wi.clearEnabled && window.console && window.console.clear();
};

wi.outputEnabled = true;
wi.logEnabled = true;
wi.infoEnabled = true;
wi.warnEnabled = true;
wi.errorEnabled = true;

wi.log = function(msg)
{
    wi.outputEnabled && wi.logEnabled && window.console && window.console.log(msg);
};

wi.info = function(msg)
{
    wi.outputEnabled && wi.infoEnabled && window.console && window.console.info(msg);
};


wi.warn = function(msg)
{
    wi.outputEnabled && wi.warnEnabled && window.console && window.console.warn(msg);
};


wi.error = function(msg)
{
    wi.outputEnabled && wi.errorEnabled && window.console && window.console.error(msg);
};

if (String.prototype.trim)
{
  wi.trim = function(s) {
      return s.trim();
    };
}
else
{
  wi.trim = function(s) {
      return s.replace(/^\s+|\s+$/g,"");
    };
}

wi.hasName = function(s, name)
{
  return (s.search(new RegExp("\\b" + name + "\\b", "g"))!=-1);
}

wi.addName = function(s,name)
{
  if (s.search(new RegExp("\\b" + name + "\\b", "g")) == -1)
    return s + " " + name;
  else
    return s;
};

wi.removeName = function(s,name)
{
  return wi.trim(s.replace(new RegExp("\\b" + name + "\\b", "g"), "").replace(/\s{2,}/g, " "));
};

wi.hasClass = function(e, className)
{
  if (e)
    return wi.hasName(e.className, className);
};

wi.addClass = function(e, className)
{
  if (e)
    e.className = wi.addName(e.className, className);
};

wi.removeClass = function(e, className)
{
  if (e)
    e.className = wi.removeName(e.className, className);
};

wi.styledButtonChild = function(label, onclick, enable)
{
    if (enable)
    {
        return wi.createElement(
            "a",
            {
                "className" : "ignoreenable",
                "innerHTML" : label,
                "href" : "#",
                "onclick" : onclick,
                "data-onclick" : onclick
            }
            );
    }
    else
    {
        return wi.createElement(
            "span",
            {
                "className": "ignoreenable",
                "innerHTML": label,
                "data-onclick": onclick
            }
            );
    }

    return child;
};

wi.enableString = { "false" : "disabled", "true" : "enabled"};

wi.styledButton = function(id, label, onclick, enable, extraClasses)
{
    var classString = "styledButton " + wi.enableString[enable];

    if (extraClasses)
        classString += " " + extraClasses;

    return wi.createElement(
        "div",
        { id:id, className:classString},
        [ wi.styledButtonChild(label, onclick, enable) ]
        );
};

wi.enableElement = function(el, enable, remember)
{
    var enable_core = function(el, enable)
        {
            if (wi.hasClass(el, "styledButton"))
            {
                if ((wi.hasClass(el, wi.enableString[!enable])))
                {
                    var oldChild = el.firstChild;
                    if (oldChild)
                    {
                        var newChild = wi.styledButtonChild(oldChild.innerHTML, oldChild["data-onclick"], enable);
                        if (newChild)
                        {
                            el.removeChild(oldChild);
                            el.appendChild(newChild);
                        }
                    }
                }
            }
            else
                el.disabled = !enable;

            wi.removeClass(el, wi.enableString[!enable]);
            wi.addClass(el, wi.enableString[enable]);
        }

    if (el)
        if (!wi.hasClass(el, "ignoreenable"))
            if (!enable)
            {
                if (remember)
                    el.previous_disabled = wi.hasClass(el, "disabled");
                enable_core(el, false);
            }
            else
                enable_core(el, remember ? !el.previous_disabled : true);
};

wi.enableElementTree = function(el, enable, remember)
{
    var children = [];

    if (el)
    {
        wi.enableElement(el, enable, remember);

        children = wi.getAllElements(el);
        if (children)
            wi.forEach(
                children,
                function(elem){
                    wi.enableElement(elem, enable, remember);
                    }
                );
    }
    else
        wi.warn("wi.enableElementTree() : arg 'el' undefined");
};

