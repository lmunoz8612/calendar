import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import moment from 'moment';
import 'moment/locale/es-mx';

import { ButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';

import swal from 'sweetalert';

import { messages, formats } from './formatLabels';

import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import "react-datepicker/dist/react-datepicker.css";
import { addNewEvent, buildICS, onEventDrop, onEventResize, onSelectEvent, onView, parseICS } from './actions';

const App = () => {

    const localizer   = momentLocalizer(moment);
    const DnDCalendar = withDragAndDrop(Calendar);
    const [events, setEvents] = useState([]);
    const [view, setView] = useState('month');
    const [defaultDate, setDefaultDate] = useState(moment().toDate());
    
    useEffect(() => {
        const loadEvents = async () => {
            swal({
                text: 'Cargando información...',
                buttons : false,
            });
            const url    = 'https://8y0l2edvg6.execute-api.us-west-2.amazonaws.com/dev/calendar/get-classes-by-student';
            const userid = 'francisco.hinojosa@u-erre.mx';
            
            const response = await fetch(`${url}/${userid}`, {
                method  : 'GET',
            });
            const { classes } = await response.json();
    
            const events = [];
            classes.forEach(event => events.push({
                id    : event.id,
                title : event.name,
                start : new Date(event.start),
                end   : new Date(event.finish)
            }));
            setEvents(events);
            swal.close();
        }
        loadEvents();
    }, []);    

    const CustomToolBar = ({ label, localizer: { messages }, onNavigate, onView, views }) => (
        <div className="calendarContainer">
            <ButtonGroup variant="outlined" aria-label="outlined button group">
                <Button key="prev_button" type="button" onClick={() => onNavigate('PREV')}>Atrás</Button>
                <Button key="today_button" type="button" onClick={() => onNavigate('TODAY')}>Hoy</Button>
                <Button key="next_button" type="button" onClick={() => onNavigate('NEXT')}>Siguiente</Button>
            </ButtonGroup>
            <h3 style={{ margin: "1em" }}>{label}</h3>
            <ButtonGroup variant="outlined" aria-label="outlined button group">
                {
                    views.map(view => (
                        <Button key={view} type="button" onClick={() => onView(view)}>{messages[view]}</Button>
                    ))
                }
            </ButtonGroup>
            <label htmlFor="contained-button-file" style={{ margin: "1em" }}>
                <input accept=".ics" id="contained-button-file" name="contained-button-file" multiple type="file" style={{ display: 'none' }} onChange={(e) => parseICS(e.target, events, setEvents)}/>
                <Button variant="contained" component="span">Importar</Button>
            </label>
            <Button href="" onClick={() => buildICS(events)} variant="contained">Exportar</Button>
        </div>
    );
    
    // console.log(events);
    
    return (
        <div className="App">
            <DnDCalendar
                defaultDate={defaultDate}
                defaultView={view}
                events={events}
                localizer={localizer}
                onView={(view) => onView(view, setView, setDefaultDate)}
                onEventDrop={(data) => onEventDrop(data, events, setEvents, setDefaultDate)}
                onEventResize={(data) => onEventResize(data, events, setEvents, setDefaultDate)}
                onSelectEvent={(data) => onSelectEvent(data, events, setEvents, setDefaultDate)}
                onSelectSlot={(slotInfo) => addNewEvent(slotInfo, events, setEvents, setDefaultDate)}
                resizable={true}
                selectable={true}
                messages={messages}
                formats={formats}
                views={['month', 'week', 'day']}
                style={{
                    height: "100vh"
                }}
                components={{ toolbar: CustomToolBar }}
                startAccessor="start"
                endAccessor="end"
            />
        </div>
    );
};

export default App;