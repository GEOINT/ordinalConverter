dojo.require("dijit.dijit"); // loads the optimized dijit layer
dojo.require("dijit.form.NumberTextBox");
dojo.require("dijit.form.Button");
dojo.require("dijit.Dialog");
dojo.require("dijit.Calendar");
//widget namespace
var DateConverters = {};
//self-executing function to encapsulate Singleton
DateConverters.OrdinalConverter = (function () {
    var instance;

    function init() {
        //Singleton object definition

        ///////////////////PRIVATE////////////////////
        var monthDaysTable = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
        var dialog;
        var calendar;
        var ordinalDay;
        var ordinalYear;

        initDOM();
        calendar.set("value", new Date()); //set date to trigger events

        function initDOM() {
            dialog = new dijit.Dialog({
                id: "ordinalDialog",
                title: "Ordinal Date Converter"
            });
            var dialogContent = dojo.create("div", {id: "ordinalWrapper"});
            var calendarDiv = dojo.create("div", {id: "ordinalCalWapper", 'class': 'ordinalText'});
            var ordinalDiv = dojo.create("div", {id: "ordinalDayWrapper", 'class': 'ordinalText'});
            dojo.place(dialogContent, dialog.domNode);
            dialogContent.appendChild(calendarDiv);
            dialogContent.appendChild(ordinalDiv);


            //the calendar
            calendar =
                    new dijit.Calendar({
                        id: "ordinalCal",
                        value: new Date()
                    });
            dojo.connect(calendar, "onChange", calUpdated);
            calendarDiv.appendChild(calendar.domNode);

            //ordinal day
            ordinalDay = new dijit.form.NumberTextBox({
                id: "ordinalDay",
                name: "ordinalDay",
                value: 1,
                constraints: {min: 1, max: 366},
                required: "true",
                _formatter: function (value) {
                    return Number(value);
                }
            });
            dojo.style(ordinalDay.domNode, "width", "5em");
            dojo.connect(ordinalDay, "onChange", updateFromOrdinal);
            ordinalDiv.appendChild(dojo.create("div", {
                id: "ordinalDayHeader",
                'class': 'ordinalHeader',
                "innerHTML": "Ordinal Day:"}));
            ordinalDiv.appendChild(ordinalDay.domNode);


            //the ordinal year
            ordinalYear = new dijit.form.NumberTextBox({
                id: "ordinalYear",
                name: "ordinalYear",
                value: 2000,
                constraints: {min: 1942, max: 3030},
                required: "true",
                _formatter: function (value) {
                    return Number(value);
                }
            });
            dojo.style(ordinalYear.domNode, "width", "5em");
            dojo.connect(ordinalYear, "onChange", updateFromOrdinal);
            ordinalDiv.appendChild(dojo.create("div", {
                id: "ordinalYearHeader",
                'class': 'ordinalHeader',
                "innerHTML": "Ordinal Year:"}));
            ordinalDiv.appendChild(ordinalYear.domNode);
        }

        /**
         * updates the ordinal year and day, explicitly not 
         * firing events (preventing eternal loop)
         */
        function calUpdated() {
            var date = calendar.get("value");
            var year = date.getFullYear();
            var ordinal = monthDaysTable[date.getMonth()] + date.getDate();
            if (isLeapYear(year)) {
                ordinal++;
            }
            ordinalDay.set("value", ordinal, false);
            ordinalYear.set("value", year, false);
        }

        /*
         * 1 - calculates the date based on ordinal day/year
         * 2 - programmatically updates the calendar
         * 3 - calendar update triggers event, calls calUpdate
         * 4 - calUpdate updates ordinal year/day, without firing events
         */
        function updateFromOrdinal() {
            if (!validateOrdinal()) {
                return false;
            }
            var year = ordinalYear.get("value");
            var day = ordinalDay.get("value");
            var month = 0; //javascript months are 0-based
            var i;
            for (index = 0; i < monthDaysTable.length; i++) {
                if (monthDaysTable[i] > day) {
                    break;
                }
                month++;
            }
            calendar.set("value", new Date(year, month, day));
        }

        function validateOrdinal() {
            if (!ordinalYear.isValid() || !ordinalDay.isValid()) {
                //reset ordinal to current date
                calendar.set("value", calendar.get("value"));
            }
        }

        function isLeapYear(year) {
            if (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)) {
                return true;
            } else {
                return false;
            }
        }

        ///////////////////END PRIVATE/////////////////
        return {
            ///////////////PUBLIC INTERFACE///////////////

            show: function () {
                dialog.show();
            },
            hide: function () {
                dialog.hide();
            },
            /**
             * Manually set the date of the converter
             * 
             * @param {Date} date
             * @returns {undefined}
             */
            setDate: function (date) {
                calendar.set("value", date);
            }
            ///////////////END PUBLIC INTERFACE///////////////
        };
    }

    return {
        //Singleton factory method
        getInstance: function () {
            if (!instance) {
                instance = init();
            }
            return instance;
        }
    };
})();