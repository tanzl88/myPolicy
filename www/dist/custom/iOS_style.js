function addCSSRule(selector, rules, index) {
    if("insertRule" in document.styleSheets[0]) {
        iOSstyle.sheet.insertRule(selector + "{" + rules + "}", 0);
    }
    else if("addRule" in document.styleSheets[0]) {
        document.styleSheets[0].addRule(selector, rules, 0);
    }
}


    var iOSstyle = document.createElement("style");
    // Add a media (and/or media query) here if you'd like!
    // style.setAttribute("media", "screen")
    // style.setAttribute("media", "only screen and (max-width : 1024px)")
    iOSstyle.appendChild(document.createTextNode(""));
    document.head.appendChild(iOSstyle);
    addCSSRule("body", "font-size: 15px;");
    addCSSRule("#calendar_container", "font-size: 0.9em;");
    addCSSRule("#calendar_head", "font-size: 0.95em; letter-spacing: -1px;");