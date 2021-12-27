const messages = {
    today           : 'Hoy',
    previous        : 'Atras',
    next            : 'Siguiente',
    month           : 'Mes',
    week            : 'Semana',
    day             : 'Día',
    date            : 'Fecha',
    time            : 'Hora',
    event           : 'Evento',
    allDay          : 'Todo el día',
    work_week       : 'Semana de trabajo',
    yesterday       : 'Ayer',
    tomorrow        : 'Mañana',
    agenda          : 'Agenda',
    noEventsInRange : 'No hay eventos en este rango.',
    showMore        : function showMore(total) {
        return "+" + total + " más";
    }
};

const textFormat = (date, format, culture, localizer) => localizer.format(date, format, culture).replace(/^\w/, firstLetter => firstLetter.toUpperCase());

const formats = {
    agendaDateFormat     : (date, culture, localizer) => `${textFormat(date, 'dddd D', culture, localizer)} de ${textFormat(date, 'MMMM Y', culture, localizer)}`,
    dayFormat            : (date, culture, localizer) => textFormat(date, 'dddd', culture, localizer),
    dayHeaderFormat      : (date, culture, localizer) => `${textFormat(date, 'dddd D', culture, localizer)} de ${textFormat(date, 'MMMM Y', culture, localizer)}`,
    dayRangeHeaderFormat : (date, culture, localizer) => `${textFormat(date.start, 'D MMMM Y', culture, localizer)} - ${textFormat(date.end, 'D MMMM Y', culture, localizer)}`,
    weekdayFormat        : (date, culture, localizer) => textFormat(date, 'dddd', culture, localizer),
    monthHeaderFormat    : (date, culture, localizer) => textFormat(date, 'MMMM Y', culture, localizer),
};

export { messages, formats };