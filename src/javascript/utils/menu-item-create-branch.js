Ext.define('CA.agile.technicalservices.CreateBranchRecordMenuItem', {
    extend: 'Rally.ui.menu.item.RecordMenuItem',
    alias: 'widget.createbranchrecordmenuitem',

    clickHideDelay: 1,

    config: {

        /**
         * @cfg {Rally.data.wsapi.Model}
         * The record of the menu
         */
        record: undefined,

        /**
         * @cfg {Function}
         *
         * A function that should return true if this menu item should show.
         * @param record {Rally.data.wsapi.Model}
         * @return {Boolean}
         */
        predicate: function (record) {
            return true;
        },

        handler: function(){
            console.log('createbranch', this.record);
            this.view.fireEvent('createbranch', this.record);
        },

        /**
         * @cfg {String}
         * The display string
         */

            text: 'Create Branch...',
            cls: 'artifact-icon icon-predecessor',


    },
    constructor:function (config) {
        config = config || {};

        this.initConfig(config);
        this.callParent(arguments);
    }
});