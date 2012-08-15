define([
    // Libs
    "jquery",
    "underscore"
],

function($, _) {

    return {
        en: {
            translation: {
                layout: {
                    header: {
                        language: 'english'
                    }
                },
                editor: {
                    choose: 'select',
                    addKey: 'add Key',
                    add: 'add',
                    'delete': 'delete',
                    edit: 'edit',
                    cancel: 'cancel',
                    save: 'save',
                    test: 'test',
                    filterKeys: 'filter keys',
                    th: {
                        key: 'key',
                            specificValue: 'specific value',
                            displayedValue: 'displayed value'
                    },
                    resourceItem: {
                        options: 'options',
                        optionsDesc: 'one option per line, eg. count=0'
                    }
                }
            }
        },

        de: {
            translation: {
                layout: {
                    header: {
                        language: 'deutsch'
                    }
                },
                editor: {
                    choose: 'Wählen',
                    addKey: 'Schlüssel hinzufügen',
                    add: 'hinzufügen',
                    'delete': 'löschen',
                    edit: 'ändern',
                    cancel: 'abbrechen',
                    save: 'speichern',
                    test: 'testen',
                    filterKeys: 'Schlüssel filtern',
                    th: {
                        key: 'Schlüssel',
                        specificValue: 'spezifischer Wert',
                        displayedValue: 'angezeigter Wert'
                    },
                    resourceItem: {
                        options: 'Optionen',
                        optionsDesc: 'Eine Option pro Zeile, bspw. count=0'
                    }
                }
            }
        }
    };
});