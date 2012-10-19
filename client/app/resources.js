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
                    filterValue: 'filter value',
                    compare: 'compare to',
                    download: 'download',
                    th: {
                      key: 'key',
                      specificValue: 'specific value',
                      displayedValue: 'displayed value',
                      compareValue: 'compare value'
                    },
                    resourceItem: {
                        compare: 'compare',
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
                    compare: 'Vergleichen mit',
                    download: 'herunterladen',
                    th: {
                        key: 'Schlüssel',
                        specificValue: 'spezifischer Wert',
                        displayedValue: 'angezeigter Wert',
                        compareValue: 'compare value'
                    },
                    resourceItem: {
                        compare: 'vergleichen',
                        options: 'Optionen',
                        optionsDesc: 'Eine Option pro Zeile, bspw. count=0'
                    }
                }
            }
        },

        it: {
            translation: {
                layout: {
                    header: {
                        language: 'italiano'
                    }
                },
                editor: {
                    choose: 'selezionare',
                    addKey: 'aggiungere chiave',
                    add: 'aggiungere',
                    'delete': 'cancellare',
                    edit: 'modificare',
                    cancel: 'cancellare',
                    save: 'memorizzare',
                    test: 'provare',
                    filterKeys: 'filtrare chiave',
                    compare: 'cparagonare a',
                    download: 'scaricare',
                    th: {
                        key: 'chiave',
                        specificValue: 'valore specificato',
                        displayedValue: 'valore indicato',
                        compareValue: 'compare value'
                    },
                    resourceItem: {
                        compare: 'paragonare',
                        options: 'opzione',
                        optionsDesc: 'un opzione per riga'
                    }
                }
            }
        },

        fr: {
            translation: {
                layout: {
                    header: {
                        language: 'français'
                    }
                },
                editor: {
                    choose: 'seléctioner',
                    addKey: 'ajouter clé',
                    add: 'ajouter',
                    'delete': 'supprimer',
                    edit: 'modifier',
                    cancel: 'annuller',
                    save: 'mémoriser',
                    test: 'tester',
                    filterKeys: 'filtrer clé',
                    compare: 'comparer avec',
                    download: 'télécharger',
                    th: {
                        key: 'clé',
                        specificValue: 'valeur spécifique',
                        displayedValue: 'valeur indiqué',
                        compareValue: 'compare value'
                    },
                    resourceItem: {
                        compare: 'comparer',
                        options: 'Option',
                        optionsDesc: 'une option par ligne'
                    }
                }
            }
        }

    };
});
