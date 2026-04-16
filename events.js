// Events page JavaScript

// Get current user from localStorage or redirect to login
let currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  location.href = 'index.html';
}

const eventNameInput = document.getElementById('event-name');
const eventDateInput = document.getElementById('event-date');
const addEventBtn = document.getElementById('add-event-btn');
const eventListDiv = document.getElementById('event-list');
const calendarContainer = document.getElementById('calendar-container');

if (!eventNameInput || !eventDateInput || !addEventBtn || !eventListDiv || !calendarContainer) {
  console.error('One or more required DOM elements are missing. Please check the HTML structure.');
}
const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function saveUserData(type, data) {
  localStorage.setItem(`${currentUser}_${type}`, JSON.stringify(data));
}

function getEventDaysForMonth(year, month) {
  const events = JSON.parse(localStorage.getItem(`${currentUser}_events`)) || [];
  return events.filter(e => {
    const d = new Date(e.date);
    return d.getFullYear() === year && d.getMonth() === month;
  }).map(e => new Date(e.date).getDate());
}

function renderList(container, items, formatFn) {
  container.innerHTML = '';
  if (items.length === 0) {
    container.innerHTML = '<p>No items added yet.</p>';
    return;
  }
  items.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = 'item';

    // Show event name to focus user on calendar highlight
    const textSpan = document.createElement('span');
    textSpan.textContent = formatFn(item);
    div.appendChild(textSpan);

    // Add View Schedule button similar to schedule page
    const viewScheduleBtn = document.createElement('button');
    viewScheduleBtn.textContent = 'View Schedule';
    viewScheduleBtn.className = 'btn btn-primary';
    viewScheduleBtn.style.marginLeft = '10px';
    viewScheduleBtn.addEventListener('click', () => {
      // Find the schedule for the event date and show details
      const schedules = JSON.parse(localStorage.getItem(`${currentUser}_schedules`)) || [];
      const eventDate = new Date(item.date);
      const eventDay = eventDate.getDate();
      const eventMonth = eventDate.getMonth();
      const eventYear = eventDate.getFullYear();

      // Filter schedules by event name or event date if present, else by day of week
      const matchingSchedules = schedules.filter(sch => {
        if (sch.eventName) {
          return sch.eventName === item.name;
        } else if (sch.eventDate) {
          return sch.eventDate === item.date;
        } else {
          return sch.days.includes(eventDate.getDay());
        }
      });

      // Always go to the event's month
      if (matchingSchedules.length > 0) {
        const scheduleDescriptions = matchingSchedules.map(sch => sch.activity).join(', ');
        // Go to the event's month and highlight the day
        goToMonth(eventYear, eventMonth, eventDay);
      } else {
        // Go to the event's month without highlighting
        goToMonth(eventYear, eventMonth, null);
      }
    });

    // Add Edit button
    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';
    editBtn.className = 'btn btn-secondary';
    editBtn.style.marginLeft = '10px';
    editBtn.addEventListener('click', () => {
      const newName = prompt('Enter new event name:', item.name);
      if (newName === null) return; // Cancelled
      const newDate = prompt('Enter new event date (YYYY-MM-DD):', item.date);
      if (newDate === null) return; // Cancelled

      if (!newName.trim() || !newDate.trim()) {
        alert('Event name and date cannot be empty.');
        return;
      }

      // Update event
      items[index] = { name: newName.trim(), date: newDate.trim() };
      saveUserData('events', items);
      renderList(container, items, formatFn);
      loadEvents();
    });

    // Add Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'btn btn-danger';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`Are you sure you want to delete event "${item.name}"?`)) {
        items.splice(index, 1);
        saveUserData('events', items);
        renderList(container, items, formatFn);
        loadEvents();
      }
    });

    div.appendChild(viewScheduleBtn);
    div.appendChild(editBtn);
    div.appendChild(deleteBtn);

    container.appendChild(div);
  });
}

let currentCalendarMonth = new Date().getMonth();
let currentCalendarYear = new Date().getFullYear();

let currentlyHighlightedDate = null; // { year, month, day }

function goToMonth(year, month, highlightDay = null) {
  currentCalendarMonth = month;
  currentCalendarYear = year;
  if (highlightDay !== null) {
    currentlyHighlightedDate = { year, month, day: highlightDay };
  } else {
    currentlyHighlightedDate = null;
  }
  renderCalendar(new Date(year, month, 1), [], onDateSelect);
}

function highlightSelectedDay(year, month, day) {
  console.log(`Highlighting day ${day} for month ${month}, year ${year}, current calendar month/year is ${currentCalendarMonth}/${currentCalendarYear}`);
  currentlyHighlightedDate = { year, month, day };
  const dateCells = calendarContainer.querySelectorAll('.calendar-date');
  dateCells.forEach(cell => {
    const cellDate = parseInt(cell.textContent);
    if (
      currentlyHighlightedDate &&
      cellDate === currentlyHighlightedDate.day &&
      currentCalendarMonth === currentlyHighlightedDate.month &&
      currentCalendarYear === currentlyHighlightedDate.year
    ) {
      cell.classList.add('selected');
    } else {
      cell.classList.remove('selected');
    }
  });
  // Removed recursive renderCalendar call to avoid resetting highlight state
}

function _renderCalendarOriginal(date, selectableDates = [], onSelectDate = null) {
  calendarContainer.innerHTML = '';

  // Header with navigation
  const header = document.createElement('div');
  header.className = 'calendar-header';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.addEventListener('click', () => {
    date = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    renderCalendar(date, selectableDates, onSelectDate);
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.addEventListener('click', () => {
    date = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    renderCalendar(date, selectableDates, onSelectDate);
  });

  const title = document.createElement('div');
  title.className = 'calendar-title';
  title.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

  header.appendChild(prevBtn);
  header.appendChild(title);
  header.appendChild(nextBtn);
  calendarContainer.appendChild(header);

  // Days of week row
  const daysRow = document.createElement('div');
  daysRow.className = 'calendar-grid';
  daysOfWeek.forEach(day => {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    dayDiv.textContent = day.substring(0,3);
    daysRow.appendChild(dayDiv);
  });
  calendarContainer.appendChild(daysRow);

  // Dates grid
  const datesGrid = document.createElement('div');
  datesGrid.className = 'calendar-grid';

  const year = date.getFullYear();
  const month = date.getMonth();

  // Get event days for this month
  const eventDays = getEventDaysForMonth(year, month);

  // First day of month
  const firstDay = new Date(year, month, 1);
  const startingDay = firstDay.getDay();

  // Number of days in month
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Fill in blank days before first day
  for (let i = 0; i < startingDay; i++) {
    const blankCell = document.createElement('div');
    blankCell.className = 'calendar-date disabled';
    datesGrid.appendChild(blankCell);
  }

  // Fill in days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateCell = document.createElement('div');
    dateCell.className = 'calendar-date';
    dateCell.textContent = day;

    // Highlight event days in green
    if (eventDays.includes(day)) {
      dateCell.classList.add('event');
    }

    // Highlight selected day in red
    if (
      currentlyHighlightedDate &&
      currentlyHighlightedDate.day === day &&
      currentlyHighlightedDate.month === month &&
      currentlyHighlightedDate.year === year
    ) {
      dateCell.classList.add('selected');
    }

    // Make date selectable if in selectableDates
    if (selectableDates.includes(day)) {
      dateCell.classList.add('selectable');
      dateCell.style.cursor = 'pointer';
      if (onSelectDate) {
        dateCell.addEventListener('click', () => onSelectDate(day));
      }
    }

    datesGrid.appendChild(dateCell);
  }

  calendarContainer.appendChild(datesGrid);
}

let originalRenderCalendarRef = _renderCalendarOriginal;
renderCalendar = function(date, selectableDates = [], onSelectDate = null) {
  currentCalendarMonth = date.getMonth();
  currentCalendarYear = date.getFullYear();
  if (
    currentlyHighlightedDate !== null &&
    (currentlyHighlightedDate.month !== currentCalendarMonth || currentlyHighlightedDate.year !== currentCalendarYear)
  ) {
    const dateCells = calendarContainer.querySelectorAll('.calendar-date.selected');
    dateCells.forEach(cell => {
      cell.classList.remove('selected');
    });
    currentlyHighlightedDate = null;
  }
  // Clear highlight if current calendar month/year changed and selected day is not in current month/year
  if (
    currentlyHighlightedDate !== null &&
    (currentlyHighlightedDate.month !== currentCalendarMonth || currentlyHighlightedDate.year !== currentCalendarYear)
  ) {
    currentlyHighlightedDate = null;
  }
  originalRenderCalendarRef(date, selectableDates, onSelectDate);
};

// Additional styling for professional look similar to schedule section
const style = document.createElement('style');
style.textContent = `
  #calendar-container {
    max-width: 700px;
    margin: 2rem auto 3rem auto;
    user-select: none;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #fff;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 0 25px rgba(0,0,0,0.1);
  }
  .calendar-header button {
    background-color: #2e7d32;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 1.2rem;
    transition: background-color 0.3s ease;
  }
  .calendar-header button:hover {
    background-color: #1b5e20;
  }
  .calendar-title {
    font-weight: 700;
    font-size: 1.6rem;
    color: #2e7d32;
    user-select: none;
  }
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
  }
  .calendar-day, .calendar-date {
    text-align: center;
    padding: 0.8rem 0;
    font-weight: 700;
    color: #2e7d32;
    user-select: none;
    border-radius: 10px;
    transition: background-color 0.3s ease, color 0.3s ease;
    box-shadow: inset 0 0 0 1px #a5d6a7;
  }
  .calendar-date {
    font-weight: 600;
    cursor: pointer;
  }
  .calendar-date:hover {
    background-color: #a5d6a7;
    color: #1b3a1a;
    box-shadow: inset 0 0 10px 3px #81c784;
  }
  .calendar-date.selected {
    background-color: #d32f2f;
    color: white;
    box-shadow: 0 0 15px 4px #b71c1c;
  }
  .calendar-date.disabled {
    color: #ccc;
    cursor: default;
    box-shadow: none;
  }
  .calendar-date.event {
    background-color: #4caf50;
    color: white;
  }
`;
document.head.appendChild(style);

function loadEvents() {
  const events = JSON.parse(localStorage.getItem(`${currentUser}_events`)) || [];
  // Show only event names to focus user on calendar highlight
  renderList(eventListDiv, events, item => `${item.name}`);
  // Render calendar with current month/year, events will be highlighted automatically
  renderCalendar(new Date(currentCalendarYear, currentCalendarMonth, 1), [], [], onDateSelect);
}

addEventBtn.addEventListener('click', () => {
  const name = eventNameInput.value.trim();
  const date = eventDateInput.value;

  if (!name || !date) {
    alert('Please enter event name and date.');
    return;
  }

  const events = JSON.parse(localStorage.getItem(`${currentUser}_events`)) || [];
  events.push({ name, date });
  saveUserData('events', events);
  renderList(eventListDiv, events, item => `${item.name}`);

  eventNameInput.value = '';
  eventDateInput.value = '';

  // Refresh calendar to the month and year of the newly added event
  const newEventDate = new Date(date);
  currentCalendarMonth = newEventDate.getMonth();
  currentCalendarYear = newEventDate.getFullYear();

  renderCalendar(new Date(currentCalendarYear, currentCalendarMonth, 1), [], [], onDateSelect);
});

// Initial load with selectable dates and selection handler
function onDateSelect(selectedDay) {
  eventDateInput.value = new Date(currentCalendarYear, currentCalendarMonth, selectedDay).toISOString().split('T')[0];
  renderCalendar(new Date(currentCalendarYear, currentCalendarMonth, 1), [], onDateSelect);
}

loadEvents();
renderCalendar(new Date(), [], [], onDateSelect);
