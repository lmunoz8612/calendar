export const icsFormatter = () => {
    if (navigator.userAgent.indexOf('MSIE') > -1 && navigator.userAgent.indexOf('MSIE 10') === -1) {
        console.log('Unsupported Browser');
        return;
    }

    const SEPARATOR = (navigator.userAgentData.platform === 'Windows') ? '\r\n' : '\n';
    const calendarEvents = [];
    const calendarStart = ['BEGIN:VCALENDAR', 'VERSION:2.0'].join(SEPARATOR);
    const calendarEnd = SEPARATOR + 'END:VCALENDAR';

    return {
        /**
         * Returns events array
         * @return {array} Events
         */
        'events': function () {
            return calendarEvents;
        },

        /**
         * Returns calendar
         * @return {string} Calendar in iCalendar format
         */
        'calendar': function () {
            return calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
        },

        /**
         * Add event to the calendar
         * @param  {string} subject     Subject/Title of event
         * @param  {string} description Description of event
         * @param  {string} location    Location of event
         * @param  {string} begin       Beginning date of event
         * @param  {string} stop        Ending date of event
         */
        'addEvent': function (subject, description, location, begin, stop) {
            // I'm not in the mood to make these optional... So they are all required
            if (typeof subject === 'undefined' || typeof description === 'undefined' || typeof location === 'undefined' || typeof begin === 'undefined' || typeof stop === 'undefined') {
                return false;
            }

            //TODO add time and time zone? use moment to format?
            const start_date = new Date(begin);
            const end_date = new Date(stop);

            const start_year = ("0000" + (start_date.getFullYear().toString())).slice(-4);
            const start_month = ("00" + ((start_date.getMonth() + 1).toString())).slice(-2);
            const start_day = ("00" + ((start_date.getDate()).toString())).slice(-2);
            const start_hours = ("00" + (start_date.getHours().toString())).slice(-2);
            const start_minutes = ("00" + (start_date.getMinutes().toString())).slice(-2);
            const start_seconds = ("00" + (start_date.getMinutes().toString())).slice(-2);

            const end_year = ("0000" + (end_date.getFullYear().toString())).slice(-4);
            const end_month = ("00" + ((end_date.getMonth() + 1).toString())).slice(-2);
            const end_day = ("00" + ((end_date.getDate()).toString())).slice(-2);
            const end_hours = ("00" + (end_date.getHours().toString())).slice(-2);
            const end_minutes = ("00" + (end_date.getMinutes().toString())).slice(-2);
            const end_seconds = ("00" + (end_date.getMinutes().toString())).slice(-2);

            // Since some calendars don't add 0 second events, we need to remove time if there is none...
            let start_time = '';
            let end_time = '';
            if (start_minutes + start_seconds + end_minutes + end_seconds !== 0) {
                start_time = 'T' + start_hours + start_minutes + start_seconds;
                end_time = 'T' + end_hours + end_minutes + end_seconds;
            }

            let start = start_year + start_month + start_day + start_time;
            let end = end_year + end_month + end_day + end_time;

            var calendarEvent = [
                'BEGIN:VEVENT',
                'CLASS:PUBLIC',
                'DESCRIPTION:' + description,
                'DTSTART:' + start,
                'DTEND:' + end,
                'LOCATION:' + location,
                'SUMMARY;LANGUAGE=es-mx:' + subject,
                'END:VEVENT'
            ].join(SEPARATOR);

            calendarEvents.push(calendarEvent);
            return calendarEvent;
        },

        /**
         * Download calendar using the saveAs function from filesave.js
         * @param  {string} filename Filename
         * @param  {string} ext      Extention
         */
        'download': function () {
            if (calendarEvents.length < 1) {
                return false;
            }
            
            const calendar = calendarStart + SEPARATOR + calendarEvents.join(SEPARATOR) + calendarEnd;
            const uri = "data:text/calendar;charset=utf8," + encodeURIComponent(calendar);
            var link = document.createElement('a');
            link.href = uri;
            link.style = 'display:none';
            link.download = 'Calendar.ics';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        },

        'parse': function (file) {
            const result = {'message' : '', content : {}};
            if (file.type === 'text/calendar') {

                const formatDate = (string) => {
                    var year = string.substring(0, 4);
                    var month = string.substring(4, 6);
                    var day = string.substring(6, 8);
                    var hour = string.substring(9, 11);
                    var minute = string.substring(11, 13);
                    var second = string.substring(13, 15);
                    return new Date(year, month-1, day, hour, minute, second);
                };

                const fileReader = new FileReader();
                return new Promise((resolve, reject) => {
                    fileReader.onerror = () => {
                        fileReader.abort();
                        reject(new DOMException('Ha ocurrido un problema al analizar el archivo.'));
                    };
                    
                    fileReader.onload = () => {
                        const icsLines = fileReader.result.split("\n");
                        const events = [];
                        let event = {};
                        let counter = 0;
                        for (let i = 0; i < icsLines.length; i++) {
                            if (!event['id' + i]) {
                                event['id'] = new Date().getTime() + counter;
                            }
                            if (icsLines[i].includes('DESCRIPTION')) {
                                const description = icsLines[i].split(':')[1].replace('\r', '');
                                event['title'] = description;
                            }
                            else if (icsLines[i].includes('SUMMARY')) { // Calendario Google
                                const summary = icsLines[i].split(':')[1];
                                if (!event['title']) {
                                    event['title'] = summary;
                                }
                            }
                            else if (icsLines[i].includes('DTSTART')) {
                                const start = icsLines[i].split(':')[1];
                                event['start'] = formatDate(start);
                            }
                            else if (icsLines[i].includes('DTEND')) {
                                const end = icsLines[i].split(":")[1];
                                event['end'] = formatDate(end);
                            }
                            else if (icsLines[i].includes('END:VEVENT')) {
                                events.push(event);
                                event = {};
                                counter++;
                            }
                        }
                        resolve(events);
                    };
                    
                    fileReader.readAsText(file);
                })
            }
            else {
                result['messsage'] = 'Archivo no válido';
                result['content'] = {};
                return result;
            }
        }
    };
};