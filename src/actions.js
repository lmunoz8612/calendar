import swal from 'sweetalert';
import { icsFormatter } from './ics-Formatter/icsFormatter';

const inputDateTimeLocalFormat = (date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.toLocaleTimeString('es-MX')}`;
};

const eventHTMLForm = (title = '', startDate = '', endDate = '') => {
    return (
        `<table>
            <tr>
                <td align="right"><label for="event_title">Nombre del Evento:</label></td>
                <td align="left"><input type="text" id="event_title" placeholder="Nombre del evento" value="${title}" size="35"/></td>
            </tr>
            <tr>
                <td align="right"><label for="event_start">Fecha de Inicio:</label></td>
                <td align="left"><input type="datetime-local" id="event_start" value="${startDate}" onchange="javascript:(function() {
                    document.querySelector('#all_day').checked = false;
                })()"/></td>
            </tr>
            <tr>
                <td align="right"><label for="event_end">Fecha de Finalización:</label></td>
                <td align="left"><input type="datetime-local" id="event_end" value="${endDate}" onchange="javascript:(function() {
                    document.querySelector('#all_day').checked = false;
                })()"/></td>
            </tr>
            <tr>
                <td align="right"><input type="checkbox" id="all_day" onclick="javascript:(function() {
                    let eventStart = document.querySelector('#event_start'), eventEnd = document.querySelector('#event_end');
                    eventStart.value = eventStart.value.slice(0, 11) + '00:00';
                    eventEnd.value = eventEnd.value.slice(0, 11) + '00:00';
                })()"></td>
                <td align="left">Todo el día</td>
            </tr>
        </table>`
    );
};

const onEventResize = (data, events, setEvents, setDefaultDate) => {
    const { start, end, event: { id } } = data;
    const newEvents = events.map(event => event.id === id ? {...event, start, end} : event);
    setEvents(newEvents);
    setDefaultDate(start);
    swal('Evento modificado', '', 'success');
    return false;
};

const onEventDrop = (data, events, setEvents, setDefaultDate) => {
    onEventResize(data, events, setEvents, setDefaultDate);
};

const onSelectEvent = (data, events, setEvents, setDefaultDate) => {
    const { id, title, start, end } = data;
    
    const startDate = new Date(start);
    const endDate = new Date(end);

    let eventInfo = `Nombre del Evento: ${title}`;
    eventInfo += `\nFecha de Inicio: ${startDate.toLocaleString('es-MX')}`;
    eventInfo += `\nFecha de Finalización: ${endDate.toLocaleString('es-MX')}`;

    swal('Información del Evento:', {
        title: 'Información del Evento:',
        buttons: {
            cancel: 'Regresar',
            danger: {
                text: 'Borrar',
                value: 'del',
            },
            defeat: {
                text: 'Modificar',
                value: 'updt',
            },
        },
        text: eventInfo
    })
    .then((value) => {
        switch (value) {
            case 'del':
                swal({
                    title: '¿Está seguro que desea borrar el evento seleccionado?',
                    icon: 'warning',
                    buttons: {
                        cancel: 'Cerrar',
                        danger: 'Aceptar'
                    },
                    dangerMode: true,
                })
                .then((willDelete) => {
                    if (willDelete) {
                        const newEvents = events.filter(event => event.id !== id);
                        setEvents(newEvents);
                        setDefaultDate(start);
                        swal('El evento ha sido borrado', { icon: 'success' });
                    }
                    else {
                        swal.close();
                    }
                });
                break;
            case 'updt':
                const form = document.createElement('div');
                const fullStartDate = inputDateTimeLocalFormat(startDate);
                const fullEndDate = inputDateTimeLocalFormat(endDate);
                form.innerHTML = eventHTMLForm(title, fullStartDate, fullEndDate);
                swal('Información del Evento:', {
                    content: {
                        element: form,
                    },
                    buttons: {
                        cancel: 'Regresar',
                        defeat: 'Modificar'
                    },
                })
                .then((value) => {
                    if (value) {
                        const newEvents = events.map(event => {
                            const eventCopy = {...event};
                            if (eventCopy.id === id) {
                                const eventTitle = document.querySelector('#event_title').value;
                                const eventStart = document.querySelector('#event_start').value;
                                const eventEnd = document.querySelector('#event_end').value;
                                if (eventTitle) eventCopy.title = eventTitle;
                                if (eventStart) eventCopy.start = new Date(eventStart);
                                if (eventEnd) eventCopy.end = new Date(eventEnd);
                            }
                            return eventCopy;
                        });
                        setDefaultDate(start);
                        setEvents(newEvents);
                        swal('El evento ha sido modificado', { icon: 'success' });
                    }
                });
                break;
            default:
                swal.close();
                break;
        }
    });
    return false;
};

const onView = (currentView, setView) => {
    setView(currentView);
};

const addNewEvent = (slotInfo, events, setEvents, setDefaultDate) => {
    const { start, end } = slotInfo;
    const startDate = new Date(start);
    const endDate = new Date(end);

    const form = document.createElement('div');
    const fullStartDate = inputDateTimeLocalFormat(startDate);
    const fullEndDate = inputDateTimeLocalFormat(endDate);
    form.innerHTML = eventHTMLForm('', fullStartDate, fullEndDate);

    swal('', {
        title: '¿Desea agregar un nuevo evento?',
        buttons: ['Cancelar', 'Agregar'],
        icon: 'info',
        content: {
            element: form,
        },
    })
    .then((value) => {
        if (value) {
            const eventTitle = document.querySelector('#event_title').value;
            const eventStart = document.querySelector('#event_start').value;
            const eventEnd = document.querySelector('#event_end').value;
            if (eventTitle && eventStart && eventEnd) {
                let newEvent = {
                    id: new Date().getTime(),
                    title: eventTitle,
                    start: new Date(eventStart),
                    end: new Date(eventEnd)
                };
                const newEvents = [...events, newEvent];
                setEvents(newEvents);
                setDefaultDate(start);
                swal('El evento ha sido agregado', { icon: 'success' });
            }
            else {
                swal('', {
                    text: 'No se puede agregar el evento porque la información está incompleta: es necesario un [Nombre del Evento], [Fecha de Inicio] y [Fecha de Finalización].',
                    icon: 'error',
                    buttons: {
                        defeat: 'Cerrar'
                    }
                });
            }
        }
    });
    return false;
};

const buildICS = (events) => {
    if (events.length > 0) {
        const icsFormater = icsFormatter();
        events.forEach(element => {
            icsFormater.addEvent(element.title, element.title, 'Reunión de Microsoft Team', element.start.toUTCString(), element.end.toUTCString());    
        });
        icsFormater.download('Calendar');
    }
    else {
        swal('', {
            text: 'No existen eventos',
            icon: 'error',
            buttons: {
                defeat: 'Cerrar'
            }
        });
    }
};

const parseICS = (input, events, setEvents) => {
    if (input && input.files[0]) {
        const icsFormater = icsFormatter();
        const icsParsed = icsFormater.parse(input.files[0]);
        icsParsed.then(result => {
            result.forEach(event => {
                events = [...events, event];
                setEvents(events);
            });
            swal('Los eventos han sido agregados', { icon: 'success' });
        });
    }
    else {
        swal('', {
            text: 'No se ha seleccionado ningún archivo',
            icon: 'error',
            buttons: {
                defeat: 'Cerrar'
            }
        })
    }
};

export { onEventResize, onEventDrop, onSelectEvent, addNewEvent, onView, buildICS, parseICS };