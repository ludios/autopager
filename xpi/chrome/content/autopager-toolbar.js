var autopagerToolbar =
{
    addAutopagerButton : function() {
        var toolbox = document.getElementById("navigator-toolbox");
        if (!toolbox)
            return;
        var toolboxDocument = toolbox.ownerDocument;

        var hasAutopagerButton = false;
        for (var i = 0; i < toolbox.childNodes.length; ++i) {
            var toolbar = toolbox.childNodes[i];
            if (toolbar.localName == "toolbar" && toolbar.getAttribute("customizable") == "true") {
                if (toolbar.currentSet.indexOf("autopager-button") > -1) {
                    hasAutopagerButton = true;
                }
            }
        }

        if(!hasAutopagerButton) {
            for (var i = 0; i < toolbox.childNodes.length; ++i) {
                toolbar = toolbox.childNodes[i];
                if (toolbar.localName == "toolbar" &&  toolbar.getAttribute("customizable") == "true" && toolbar.id == "nav-bar") {
                    var newSet = "";
                    var child = toolbar.firstChild;
                    while (child) {
                        if(!hasAutopagerButton && (child.id == "urlbar-container" || child.id =="nav-bar-inner") ) {
                            newSet += "autopager-button,";
                            hasAutopagerButton = true;
                        }
                        newSet += child.id + ",";
                        child = child.nextSibling;
                    }
                    newSet = newSet.substring(0, newSet.length - 1);
                    toolbar.currentSet = newSet;
                    toolbar.setAttribute("currentset", newSet);
                    toolboxDocument.persist(toolbar.id, "currentset");
                    try {
                        BrowserToolboxCustomizeDone(true);
                    } catch (e) {}
                    break;
                }
            }
        }
    },
    removeAutopagerButton : function() {
        var toolbox = document.getElementById("navigator-toolbox");
        var toolboxDocument = toolbox.ownerDocument;

        var hasAutopagerButton = false;
        for (var i = 0; i < toolbox.childNodes.length; ++i) {
            var toolbar = toolbox.childNodes[i];
            if (toolbar.localName == "toolbar" && toolbar.getAttribute("customizable") == "true") {
                if (toolbar.currentSet.indexOf("autopager-button") > -1) {
                    hasAutopagerButton = true;
                }
            }
        }

        if(hasAutopagerButton) {
            for (var i = 0; i < toolbox.childNodes.length; ++i) {
                toolbar = toolbox.childNodes[i];
                if (toolbar.localName == "toolbar" &&  toolbar.getAttribute("customizable") == "true" && toolbar.id == "nav-bar") {
                    var newSet = "";
                    var child = toolbar.firstChild;
                    while (child) {
                        if(child.id != "autopager-button")
                        {
                            newSet += child.id + ",";
                        }
                        child = child.nextSibling;
                    }
                    newSet = newSet.substring(0, newSet.length - 1);
                    toolbar.currentSet = newSet;
                    toolbar.setAttribute("currentset", newSet);
                    toolboxDocument.persist(toolbar.id, "currentset");
                    try {
                        BrowserToolboxCustomizeDone(true);
                    } catch (e) {}
                    break;
                }
            }
        }
    },

    autopagerToobarInit : function() {
        //var autopagerHome = "http://www.teesoft.info/content/view/27/1/";
        var autopagerHome = "http://autopager.teesoft.info/index.html?app=autopager";
        //    var autopagerHome = "http://www.teesoft.info";
        var lv = autopagerPref.loadPref("last_version");
        if (typeof lv=="undefined" || lv==null || lv=="") {  // new user        
            if (autopagerBwUtil.autopagerOpenIntab(autopagerHome + "&i=0.6.0.14",null))
            {
                autopagerPref.savePref("last_version", "0.6.0.14");
                autopagerToolbar.addAutopagerButton();
                if (autopagerBwUtil.isFennec())
                {
                    autopagerPref.saveBoolPref("noprompt", true);
                }
                //autopagerBwUtil.autopagerOpenIntab("chrome://autopager/content/options.xul");
            }
            autopagerConfig.autopagerUpdate();
        } else { // check for upgrade
            var lastVersion = autopagerPref.loadPref("last_version");
            if (lastVersion != "0.6.0.14")
            {
                if (autopagerBwUtil.autopagerOpenIntab(autopagerHome+ "&u=" + lastVersion + "&i=0.6.0.14",null))
                {
                    autopagerPref.savePref("last_version", "0.6.0.14");
                //autopagerToolbar.addAutopagerButton();
                    //autopagerBwUtil.autopagerOpenIntab("chrome://autopager/content/options.xul");
                }
                autopagerConfig.autopagerUpdate();
            }
        }
    }
};

//window.addEventListener("load", function() {
//    var self = arguments.callee;
//    window.removeEventListener("load",self,false);
//    setTimeout(autopagerToolbar.autopagerToobarInit, 250);
//}, false);
