Ext.define("branch-creator", {
    extend: 'Rally.app.App',
    componentCls: 'app',
    logger: new Rally.technicalservices.Logger(),
    defaults: { margin: 10 },
    items: [
        {xtype:'container',itemId:'message_box',tpl:'Hello, <tpl>{_refObjectName}</tpl>'},
        {xtype:'container',itemId:'display_box'}
    ],

    integrationHeaders : {
        name : "branch-creator"
    },

    config: {
        defaultSettings: {
            artifactType: 'userstory',
            //urlRoot: 'http://www.google.com/#q=',
            urlRoot: null,
            urlSuffix: '/plugins/servlet/create-branch?issueKey={0}&issueType={1}&issueSummary={2}',
            issueType: 'Bug'
        }
    },
    artifactFetchList: ['FormattedID','Name'],
    RALLY_TABS: ["My Home","Plan","Portfolio","Track","Quality","Reports"],
    launch: function() {

        var artifactType = this.getArtifactType();
        this.logger.log('launch', artifactType, localStorage);

        if (!artifactType){
            Rally.ui.notify.Notifier.showError({message: "Please configure an artifact type."});
            return;
        }

        if (!this.getUrlRoot()){
            Rally.ui.notify.Notifier.showError({message: "Please configure a Bit bucket server in the app settings."});
            return;
        }

        var previousArtifact = this.getPreviousArtifact(this.getArtifactType());
        if (previousArtifact){
            this.fetchArtifact(artifactType, previousArtifact, this.artifactFetchList).then({
                success: this.launchWindow,
                failure: this.showErrorNotification,
                scope: this
            });
        } else {
            this.buildGrid();
        }
    },
    getArtifactType: function(){
        return this.getSetting('artifactType');
    },
    getPreviousArtifact: function(type){
        var artifactUrl = localStorage && localStorage.getItem('previous-hash') || null;
        if (!artifactUrl){
            return null;
        }

        var artifactInfo = artifactUrl.split('/');
        this.logger.log('getPreviousArtifact url', artifactUrl, artifactInfo, type);

        if (artifactInfo && artifactInfo.length > 1){

            var artifactId = artifactInfo[artifactInfo.length-1],
                artifactType = artifactInfo[artifactInfo.length-2];

            this.logger.log('getPreviousArtifact artifactType, artifactId', artifactType, artifactId);
            if (artifactType === type){
                return artifactId;
            } else {
                //artifact ID should be the name of the page that they were last at
                var page = artifactId;
                if (Number(page) > 0){
                    page = artifactType + '/' + page;
                }
                this.logger.log('Page not a detail page', page);
                //Now loop through the tabs to see which one they were last on
                var re = new RegExp("\\/" + page + "\\?qdp=%2Fdetail%2F" + type + "%2F(\\d+)");
                artifactId = null;
                Ext.Array.each(this.RALLY_TABS, function(tab){
                    var match = localStorage[tab].match(re);
                    this.logger.log('match', tab, localStorage[tab], match);
                    if (match && match.length > 1){
                        artifactId = match[1];
                        return false;
                    }
                }, this);
                return artifactId;
            }
        }
        return null;
    },
    buildGrid: function(){
        this.logger.log('buildGrid');

        this.removeAll();

        var modelNames = [this.getArtifactType()],
            context = this.getContext();

        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: modelNames,
            autoLoad: true,
            enableHierarchy: false
        }).then({
            success: function(store){
                this.add({
                    xtype: 'rallygridboard',
                    context: context,
                    modelNames: modelNames,
                    toggleState: 'grid',
                    stateful: false,
                    plugins: [
                        {
                            ptype: 'rallygridboardinlinefiltercontrol',
                            inlineFilterButtonConfig: {
                                stateful: true,
                                stateId: context.getScopedStateId('filters'),
                                modelNames: modelNames,
                                inlineFilterPanelConfig: {
                                    quickFilterPanelConfig: {
                                        defaultFields: [
                                            'ArtifactSearch',
                                            'Owner'
                                        ]
                                    }
                                }
                            }
                        },
                        {
                            ptype: 'rallygridboardfieldpicker',
                            headerPosition: 'left',
                            modelNames: modelNames,
                            stateful: true,
                            stateId: context.getScopedStateId('columns-example')
                        }
                    ],
                    gridConfig: {
                        store: store,
                        columnCfgs: [
                            'FormattedID',
                            'Name',
                            'State',
                            'Priority',
                            'Severity'
                        ],
                        viewConfig: {
                            xtype: 'rallytreeview',
                            enableTextSelection: false,
                            animate: false,
                            loadMask: false,
                            forceFit: true,
                            plugins: [
                                'rallytreeviewdragdrop',
                                'rallyviewvisibilitylistener'
                            ],
                            listeners: {
                                createbranch: this.launchWindow,
                                scope: this
                            }
                        }
                    },
                    height: this.getHeight()
                });
            },
            scope: this
        });
    },
    showErrorNotification: function(msg){
        this.logger.log('showErrorNotification', msg);
        Rally.ui.notify.Notifier.showError({message: msg});
    },
    getCreateBranchURL: function(artifactRecord){
        var urlBase = this.getUrlRoot(),
            createBranchSuffix = this.getSetting('urlSuffix'),
            url = urlBase + Ext.String.format(createBranchSuffix, artifactRecord.get('FormattedID'), this.getIssueType(), artifactRecord.get('Name'));

        this.logger.log('getCreateBranchURL', urlBase, url);

        return encodeURI(url);
    },
    getUrlRoot: function(){
        var url = this.getSetting('urlRoot');

        if (!url){
            return null;
        }

        //remove the trailing slash, if its there
        if (/.*\/$/.test(url)){
            url = url.slice(0, -1);
        }
        //add http prefix if they did not add it
        if (!/http:\/\//.test(url) && !/https:\/\//.test(url)){
            url = "http://" + url;
        }
        return url;
    },
    getIssueType: function(){
        return this.getSetting('issueType');
    },

    launchWindow: function(artifactRecord){

        var url = this.getCreateBranchURL(artifactRecord);

        this.logger.log('launchWindow',url);
        window.open(url);

        Rally.ui.notify.Notifier.show({message: "Create Branch initiated for " + artifactRecord.get('FormattedID')});

        this.buildGrid();
    },
    fetchArtifact: function(type, artifactObjectID, fetchList){
        this.logger.log('fetchArtifact', type, artifactObjectID);
        var deferred = Ext.create('Deft.Deferred');
        if (!artifactObjectID || !type){
            deferred.reject("Please provide a valid artifact ObjectID or artifact Type");
        } else {
            this.loadArtifactModel(type).then({
                success: function(model){
                    model.load(artifactObjectID, {
                        fetch: fetchList,
                        callback: function(result, operation) {
                            if(operation.wasSuccessful()) {
                                deferred.resolve(result);
                            } else {
                                deferred.reject("Error loading artifact [" + artifactObjectID + "]:  " + operation.error.errors.join(','));
                            }
                        }
                    });
                },
                failure: function(){
                    deferred.reject('Error loading artifact model: ' + this.getArtifactType());
                },
                scope: this
            });
        }
        return deferred.promise;
    },
    loadArtifactModel: function(type){
        var deferred = Ext.create('Deft.Deferred');
        Rally.data.ModelFactory.getModel({
            type: type,
            success: function(model) {
                deferred.resolve(model);
            }
        });
        return deferred;
    },
    getSettingsFields: function(){
        return [{
            name: 'urlRoot',
            xtype: 'rallytextfield',
            width: 500,
            labelWidth: 150,
            fieldLabel: 'Bit Bucket Server',
            labelAlign: 'right',
            emptyText: 'https://bitbucket.mydomain.com',
            maskRe:  /[a-zA-Z0-9\.\-]/
        }];
    },
    getOptions: function() {
        return [
            {
                text: 'About...',
                handler: this._launchInfo,
                scope: this
            }
        ];
    },
    
    _launchInfo: function() {
        if ( this.about_dialog ) { this.about_dialog.destroy(); }
        this.about_dialog = Ext.create('Rally.technicalservices.InfoLink',{});
    },
    
    isExternal: function(){
        return typeof(this.getAppId()) == 'undefined';
    }
    
});
