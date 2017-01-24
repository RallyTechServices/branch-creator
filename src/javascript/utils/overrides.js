Ext.override(Rally.ui.menu.DefaultRecordMenu, {
    //Override the getMenuItems function to return only the menu items that we are interested in.
    _getMenuItems: function() {
        var record = this.getRecord(),
            items = [{
                xtype: 'createbranchrecordmenuitem',
                view: this.view,
                record: record
            }],
            popoverPlacement = this.popoverPlacement || Rally.ui.popover.Popover.DEFAULT_PLACEMENT;

        if (this.showInlineAdd) {
            items.push({
                xtype: 'rallyrecordmenuiteminlineaddchild',
                view: this.view,
                record: record
            });
            items.push({
                xtype: 'rallyrecordmenuiteminlineaddpeer',
                view: this.view,
                record: record
            });
            items.push({
                xtype: 'rallyrecordmenuitemaddexistingtestcases',
                view: this.view,
                record: record
            });
            items.push({
                xtype: 'rallyrecordmenuitemaddexistingdefects',
                view: this.view,
                record: record
            });
        } else {
            if (this.showAddTasks !== false) {
                items.push({
                    xtype: 'rallyrecordmenuitemaddtask',
                    record: record,
                    owningEl: this.owningEl,
                    popoverPlacement: popoverPlacement
                });
            }

            if (this.showAddDefects !== false) {
                items.push({
                    xtype: 'rallyrecordmenuitemadddefect',
                    record: record,
                    owningEl: this.owningEl,
                    popoverPlacement: popoverPlacement
                });
            }

            if (this.showAddTestCases !== false) {
                items.push({
                    xtype: 'rallyrecordmenuitemaddtestcase',
                    record: record,
                    owningEl: this.owningEl,
                    popoverPlacement: popoverPlacement
                });
            }

            if (this.showAddChildMenuItem !== false) {
                items.push({
                    xtype: 'rallyrecordmenuitemaddchild',
                    record: record
                });
            }
        }

        if (this.showCopyTasksFrom !== false) {
            items.push({
                xtype: 'rallyrecordmenuitemcopytasksfrom',
                record: record
            });
        }

        items.push({
            xtype: 'menuseparator',
            margin: 0,
            padding: 0
        });

        items.push(
            {
                xtype: 'rallyrecordmenuitemshowdetails',
                record: record
            },
            {
                xtype: 'rallyrecordmenuitemedit',
                record: record
            },
            {
                xtype: 'rallyrecordmenuitemruntestset',
                record: record,
                actionScope: this
            }
        );

        if (this.showCopyMenuItem !== false) {
            items.push({
                    xtype: 'rallyrecordmenuitemcopy',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuCopy(),
                    afterAction: this.getOnRecordMenuCopy(),
                    actionScope: this
                }
            );
        }

        items.push(
            {
                xtype: 'rallyrecordmenuitemcopyuser',
                record: record
            }
        );

        items.push({
            xtype: 'menuseparator',
            margin: 0,
            padding: 0
        });

        if (this.showRankMenuItems !== false &&
            (!_.isFunction(this.shouldRecordBeExtremeRankable) || this.shouldRecordBeExtremeRankable(record))) {
            items.push(
                {
                    xtype: 'rallyrecordmenuitemrankextreme',
                    rankRecordHelper: this.getRankRecordHelper(),
                    rankPosition: 'highest',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuRankHighest(),
                    actionScope: this
                },
                {
                    xtype: 'rallyrecordmenuitemrankextreme',
                    rankRecordHelper: this.getRankRecordHelper(),
                    rankPosition: 'lowest',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuRankLowest(),
                    actionScope: this
                }
            );

            if (!_.isFunction(this.shouldRecordBeRankable) || this.shouldRecordBeRankable(record)) {
                items.push(
                    {
                        xtype: 'rallyrecordmenuitemmovetoposition',
                        record: record,
                        rankRecordHelper: this.getRankRecordHelper()
                    }
                );
            }

            items.push(
                {
                    xtype: 'menuseparator',
                    margin: '0 0 0 0',
                    padding: '0 0 0 0'
                });
        }

        if (this.showSplitMenuItem !== false) {
            items.push(
                {
                    xtype: 'rallyrecordmenuitemsplit',
                    record: record
                },
                {
                    xtype: 'menuseparator',
                    margin: '0 0 0 0',
                    padding: '0 0 0 0'
                }
            );
        }

        if (this.showWatchMenuItem !== false && Rally.data.notifications.Api.enabled) {
            items.push(
                {
                    xtype: 'rallyrecordmenuitemwatch',
                    record: record,
                    actionScope: this,
                    enableBetaBadge: true
                },
                {
                    xtype: 'menuseparator',
                    margin: '0 0 0 0',
                    padding: '0 0 0 0'
                }
            );
        }

        if (this.collectionStore && _.isFunction(this.shouldBeRemovable) && this.shouldBeRemovable(record)) {
            items.push({
                xtype: 'rallyrecordmenuitemremove',
                actionScope: this,
                afterAction: this.onRecordMenuRemove,
                collectionStore: this.collectionStore,
                record: record
            });
        }

        if (this.showDeleteMenuItem !== false) {
            items.push(
                {
                    xtype: 'rallyrecordmenuitemdelete',
                    record: record,
                    beforeAction: this.getOnBeforeRecordMenuDelete(),
                    afterAction: this.getOnRecordMenuDelete(),
                    actionScope: this
                }
            );
        }

        return items;
    }
});