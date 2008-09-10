
function AutoPagerUpdateType(type,defaultLocales,defaultUrl,contentType,filenamePrefix,callback,xpath,desc)
{
    this.type=type;
    this.defaultLocales = defaultLocales;
    this.defaultUrl=defaultUrl;
    this.contentType = contentType;
    this.filenamePrefix = filenamePrefix;
    this.callback = callback;
    this.xpath = xpath;
    this.desc=desc;
}

function AutoPagerUpdateSite(owner,locales,url,contenttype,desc,filename,xpath,enabled,typeName,updateperiod)
{
    if (owner!=null)
    {
        this.owner = owner;
        this.locales=locales;
        this.url=url;
        this.contenttype=contenttype;
        this.filename = filename;
        this.triedTime=0;
        this.enabled = enabled;
        this.xpath = xpath;
        this.desc=desc;
        this.updateType = AutoPagerUpdateTypes.getType(typeName);
        this.callback = this.updateType.callback;
        this.updateperiod = updateperiod;//use global setting
    }
    this.defaulted = true;
    this.lastupdate =null;
}

var AutoPagerUpdateTypes = 
{
    types : null,
    updateSites: null,
    init : function (){
        if (this.types == null)
        {
            this.types =  new Array();

            this.types.push(new AutoPagerUpdateType("autopager-xml","all",
            "http://www.teesoft.info/components/com_autopager/export.php?version={version}&lastupdate={timestamp}",
            "text/xml; charset=utf-8",
            "ap-",this.xmlConfigCallback,"//site",
            "default configurations on autopager.mozdev.org"));
            
            this.types.push(new AutoPagerUpdateType("autopager-freetext","all",
            "http://examplehost/examplepage",
            "text/html; charset=utf-8",
            "af-",this.blogConfigCallback,"//div[@class='autopager-setting']","configurations in web pages"));

            this.types.push(new AutoPagerUpdateType("autopagerize","all",
            "http://swdyh.infogami.com/autopagerize","text/html; charset=utf-8",
            "az-",AutoPagerize.onload,'//*[@class="autopagerize_data"]',"autopagerize configurations"));

            this.types.push(new AutoPagerUpdateType("autopagerize-json","all",
            "http://wedata.net/databases/AutoPagerize/items.json?lastupdate={timestamp}","text/plain; charset=utf-8",
            "az-",AutoPagerize.onJsonLoad,'//*[@class="autopagerize_data"]',"autopagerize configurations"));

        }
    },
    getType : function (name)
    {
        for(var i in this.types)
        {
            if (this.types[i].type == name)
            {
                return this.types[i];
            }
        }
        return null;
    },
    getUpdateSites : function()
    {
        var sites = AutoPagerUpdateTypes.loadAllSites();
        if (sites == null|| sites.length==0)
        {
            sites = this.getDefaultSites();
            //this.saveSettingSiteConfig(sites);
        }
        return sites;
    },
    getDefaultSites : function()
    {
            var sites = new Array();
        
            sites.push(new AutoPagerUpdateSite("pagerization","all",
                        "http://k75.s321.xrea.com/pagerization/siteinfo","text/html; charset=utf-8",
                        "pagerization configurations",
                        "pagerization.xml",'//*[@class="autopagerize_data"]',false,"autopagerize",0));

            sites.push(new AutoPagerUpdateSite("autopagerize","all",
                        "http://swdyh.infogami.com/autopagerize","text/html; charset=utf-8",
                        "autopagerize configurations",
                        "autopagerize.xml",'//*[@class="autopagerize_data"]',true,"autopagerize",0));

            sites.push(new AutoPagerUpdateSite("autopagerize","all",
                        "http://wedata.net/databases/AutoPagerize/items.json?lastupdate={timestamp}","text/plain; charset=utf-8",
                        "autopagerize new configurations",
                        "autopagerizeJson.xml",'',true,"autopagerize-json",168));

            sites.push(new AutoPagerUpdateSite("chinalist","all",
                        "http://www.quchao.com/projects/chinalist/","text/html; charset=utf-8",
                        "pagerization chinalist configurations",
                        "chinalist.xml",'//*[@class="autopagerize_data"]',true,"autopagerize",168));
            
            sites.push(new AutoPagerUpdateSite("Wind Li","all",
                        "http://blogs.sun.com/wind/entry/autopager_site_config#comments","text/html; charset=utf-8",
                        "configurations added to blog",
                        "blogcomments.xml","//div[@class='comment even' or @class='comment odd']",true,"autopager-freetext",0));

                    
            sites.push(new AutoPagerUpdateSite("Wind Li","all",
                        "http://autopager.mozdev.org/conf.d/autopager.xml","text/xml; charset=utf-8",
                        "default configurations on autopager.mozdev.org",
                        "autopagerMozdev.xml","//site",true,"autopager-xml",0));

            sites.push(new AutoPagerUpdateSite("Wind Li","all",
                        "http://www.teesoft.info/components/com_autopager/export.php?version={version}&lastupdate={timestamp}","text/xml; charset=utf-8",
                        "default configurations @ teesoft.info",
                        "autopagerTee.xml","//site",true,"autopager-xml",-2));

            sites.push(new AutoPagerUpdateSite("Wind Li","all",
                        "http://www.teesoft.info/components/com_autopager/export.php?approvedOnly=0&version={version}&lastupdate={timestamp}","text/xml; charset=utf-8",
                        "Experimental configurations @ teesoft.info",
                        "autopagerBeta.xml","//site",false,"autopager-xml",-2));

            sites.push(new AutoPagerUpdateSite("Wind Li","all",
                        "","text/html; charset=utf-8",
                        "user created configurations",
                        "autopager.xml","//site",true,"autopager-xml",-2));
           return sites;
        
    },
    xmlConfigCallback : function(doc,updatesite)
    {
        var sites = autopagerConfig.loadConfigFromDoc(doc);
        return sites;
    },
    blogConfigCallback : function(doc,updatesite)
    {
        var commentPath= updatesite.xpath;// "//div[@class='comment even' or @class='comment odd']";
        var nodes =doc.evaluate(commentPath, doc, null, 0, null);
        var allSites = new Array();
        for (var node = null; (node = nodes.iterateNext()); ) {
            
            var sites = autopagerConfig.loadConfigFromStr( "<root>" + node.textContent + "</root>",false);
            autopagerConfig.mergeArray(allSites,sites,true);
        }
        return allSites;
    },
    loadAllSites : function ()
    {
        
        var configContents="";
        var sites= null;
        try{
            
            configContents= autopagerConfig.autopagerGetContents(autopagerConfig.getConfigFileURI("all-sites.xml"));
            var doc = autopagerConfig.autopagerDomParser.parseFromString(configContents, "text/xml");
            sites = this.loadSettingSitesFromDoc(doc);
//            for(var i in sites)
//            {
//                this.allUpdateSites[sites[i].filename] = sites[i];
//            }
                      
        }catch(e)
        {
            //alert(e);
        }
        return sites;
        
    },
    loadSettingSitesFromDoc : function (doc)
    {
        var sites = new Array();
    
        var nodes = doc.evaluate("//update-site", doc, null, 0, null);
        if (nodes == null)
            return sites;
        for (var node = null; (node = nodes.iterateNext()); ) {
            var site = new AutoPagerUpdateSite();

            var childNodes = node.childNodes;
            //childNode = childNodes[i]
            for (var i = 0, childNode = null; (childNode = childNodes[i]) ; i++) {
                var nodeName = childNode.nodeName;
                if (nodeName == "owner") {
                    site.owner	= autopagerConfig.getValue(childNode) ;
                }
                else if (nodeName == "locales") {
                    site.locales = autopagerConfig.getValue(childNode);
                }else  if (nodeName == "url") {
                    site.url = autopagerConfig.getValue(childNode);
                }else if (nodeName == "contenttype") {
                    site.contenttype	= (autopagerConfig.getValue(childNode) == 'true');
                }
                else if (nodeName == "desc") {
                    site.desc = autopagerConfig.getValue(childNode);
                }
                else if (nodeName == "filename") {
                    site.filename	= autopagerConfig.getValue(childNode);
                }
                else if (nodeName == "updateType") {
                    site.updateType	= AutoPagerUpdateTypes.getType(autopagerConfig.getValue(childNode));
                    site.callback = site.updateType.callback;
                    if (site.contenttype==null || site.contenttype=="")
                        site.contenttype = site.updateType.contentType;
                }
                else if (nodeName == "enabled") {
                    site.enabled = (autopagerConfig.getValue(childNode) == 'true');
                }
                else if (nodeName == "xpath") {
                    site.xpath	= autopagerConfig.getValue(childNode) ;
                }
                else if (nodeName == "updateperiod") {
                    site.updateperiod	= autopagerConfig.getValue(childNode) ;
                }
                else if (nodeName == "lastupdate") {
                    site.lastupdate	= autopagerConfig.getValue(childNode) ;
                }                
                else if (nodeName == "defaulted") {
                    site.defaulted	= autopagerConfig.getValue(childNode) ;
                }                
                
            }
            sites.push(site);
        }
        return sites;
        
    },
    saveAllSettingSiteConfig : function() {
        this.saveSettingSiteConfig(UpdateSites.getUpdateSites());
    },
    saveSettingSiteConfig : function(sites) {
        this.saveSettingSiteConfigToFile(sites,autopagerConfig.getConfigFile("all-sites.xml")); 
    },
    loadSettingSiteConfigFromJSON : function(configContents) {
        var sites = autopagerJSON.parse(configContents);
        for (i in sites)
        {
            var site = sites[i]
            site.updateType	= AutoPagerUpdateTypes.getType(site.updateType);
            site.callback = site.updateType.callback;
            if (site.contenttype==null && site.contenttype=="")
                site.contenttype = site.updateType.contentType;
        }
        return sites;
    },
    saveSettingSiteConfigToJSON : function(sites,saveFile) {
        var jsonString = autopagerJSON.stringify(sites,function(key, value){
            if (key=="triedTime")
                return 0;
            if ( key=="callback")
                return null;
            if (key=="updateType")
                return value.type;
                
            return value;
        });
        try{
            var configStream = autopagerConfig.getWriteStream(saveFile);
            configStream.write(jsonString,jsonString.length);
            configStream.close();
        }catch(e)
        {
            alert(e);
        }

    },
    saveSettingSiteConfigToFile : function(sites,saveFile) {
        
        try{
            var doc = document.implementation.createDocument("", "all-sites", null);
            doc.firstChild.appendChild(doc.createTextNode("\n"))
            
            if (sites!=null)
            {
                for (var i = 0, siteObj = null; (siteObj = sites[i]); i++) {
                    var siteNode = doc.createElement("update-site");
                    
                    autopagerConfig.createNode(siteNode,"owner",siteObj.owner);
                    autopagerConfig.createNode(siteNode,"locales",siteObj.locales);
                    autopagerConfig.createNode(siteNode,"url",siteObj.url);
                    autopagerConfig.createNode(siteNode,"contenttype",siteObj.contenttype);
                    autopagerConfig.createNode(siteNode,"filename",siteObj.filename);
                    autopagerConfig.createNode(siteNode,"enabled",siteObj.enabled);
                    autopagerConfig.createNode(siteNode,"xpath",siteObj.xpath);
                    autopagerConfig.createNode(siteNode,"desc",siteObj.desc);
                    autopagerConfig.createNode(siteNode,"updateType",siteObj.updateType.type);
                    autopagerConfig.createNode(siteNode,"updateperiod",siteObj.updateperiod);
                    autopagerConfig.createNode(siteNode,"lastupdate",siteObj.lastupdate);
                    autopagerConfig.createNode(siteNode,"defaulted",siteObj.defaulted);

                    doc.firstChild.appendChild(siteNode);
                    doc.firstChild.appendChild(doc.createTextNode("\n"));
                }
            }
            var configStream = autopagerConfig.getWriteStream(saveFile);
            new XMLSerializer().serializeToStream(doc, configStream, "utf-8");
            configStream.close();
        }catch(e)
        {
            alert(e);
        }
    }
}
AutoPagerUpdateTypes.init();