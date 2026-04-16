document.addEventListener('DOMContentLoaded', () => {
  const calendarContainer = document.getElementById('calendar-container');
  const weekdayCheckboxes = document.querySelectorAll('.weekday-checkbox');
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const scheduleActivityInput = document.getElementById('schedule-activity');
  const addScheduleBtn = document.getElementById('add-schedule-btn');
  const scheduleListDiv = document.getElementById('schedule-list');

  if (!localStorage.getItem('currentUser')) {
    window.location.href = 'index.html';
    return;
  }
  const currentUser = localStorage.getItem('currentUser');

  let currentDate = new Date();
  let selectedWeekdays = JSON.parse(localStorage.getItem(`selectedWeekdays_${currentUser}`)) || [];
  let schedules = JSON.parse(localStorage.getItem(`schedules_${currentUser}`)) || [];
  let editingIndex = -1;
  let currentViewSchedule = -1;

  const colors = ['#c8e6c9'];

  // Add styles for preview highlight
  const style = document.createElement('style');
  style.textContent = `
    .preview {
      background-color: #f1f8e9 !important;
      border: 2px solid #a5d6a7 !important;
      box-shadow: 0 0 5px #a5d6a7 !important;
    }
  `;
  document.head.appendChild(style);

  function saveSelectedWeekdays() {
    localStorage.setItem(`selectedWeekdays_${currentUser}`, JSON.stringify(selectedWeekdays));
  }

  function saveSchedules() {
    localStorage.setItem(`schedules_${currentUser}`, JSON.stringify(schedules));
  }

  function editSchedule(index) {
    if (index >= 0 && index < schedules.length) {
      const schedule = schedules[index];
      scheduleActivityInput.value = schedule.activity;
      selectedWeekdays = [...schedule.days];
      weekdayCheckboxes.forEach(checkbox => {
        checkbox.checked = selectedWeekdays.includes(parseInt(checkbox.value));
      });
      editingIndex = index;
      addScheduleBtn.textContent = 'Update Schedule';
    }
  }

  function deleteSchedule(index) {
    if (index >= 0 && index < schedules.length) {
      schedules.splice(index, 1);
      saveSchedules();
      renderSchedules();
    }
  }

  function renderSchedules() {
    scheduleListDiv.innerHTML = '';
    if (schedules.length === 0) {
      scheduleListDiv.innerHTML = '<p>No schedules added yet.</p>';
      return;
    }
    schedules.forEach((schedule, index) => {
      const div = document.createElement('div');
      div.className = 'item';

      const textSpan = document.createElement('span');
      if (schedule.days.length === 0) {
        textSpan.textContent = schedule.activity;
      } else {
        textSpan.textContent = `${schedule.activity} on ${schedule.days.map(d => daysOfWeek[d]).join(', ')}`;
      }
      div.appendChild(textSpan);

      const colorIndicator = document.createElement('div');
      colorIndicator.style.width = '20px';
      colorIndicator.style.height = '20px';
      colorIndicator.style.backgroundColor = schedule.color || colors[index % colors.length];
      colorIndicator.style.borderRadius = '50%';
      colorIndicator.style.marginLeft = '10px';
      colorIndicator.style.display = 'inline-block';
      div.appendChild(colorIndicator);

      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.style.marginLeft = '10px';
      editBtn.addEventListener('click', () => {
        editSchedule(index);
      });
      div.appendChild(editBtn);

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.style.marginLeft = '5px';
      deleteBtn.addEventListener('click', () => {
        deleteSchedule(index);
      });
      div.appendChild(deleteBtn);

      const separateBtn = document.createElement('button');
      separateBtn.textContent = 'View Schedule';
      separateBtn.className = 'btn btn-primary';
      separateBtn.style.marginLeft = '5px';
      separateBtn.addEventListener('click', () => {
        currentViewSchedule = index;
        renderCalendar(currentDate);
      });
      div.appendChild(separateBtn);

      scheduleListDiv.appendChild(div);
    });
  }

  function getScheduledWeekdays() {
    const weekdaysSet = new Set();
    schedules.forEach(sch => {
      if (sch.days && Array.isArray(sch.days)) {
        sch.days.forEach(day => weekdaysSet.add(day));
      }
    });
    return Array.from(weekdaysSet);
  }

  function renderCalendar(date) {
    calendarContainer.innerHTML = '';

    // Header with navigation
    const header = document.createElement('div');
    header.className = 'calendar-header';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = '<';
    prevBtn.addEventListener('click', () => {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      renderCalendar(currentDate);
    });

    const nextBtn = document.createElement('button');
    nextBtn.textContent = '>';
    nextBtn.addEventListener('click', () => {
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      renderCalendar(currentDate);
    });

    const title = document.createElement('div');
    title.className = 'calendar-title';
    title.textContent = date.toLocaleString('default', { month: 'long', year: 'numeric' });

    header.appendChild(prevBtn);
    header.appendChild(title);
    header.appendChild(nextBtn);

    if (currentViewSchedule !== -1) {
      const resetBtn = document.createElement('button');
      resetBtn.textContent = 'Reset View';
      resetBtn.addEventListener('click', () => {
        currentViewSchedule = -1;
        renderCalendar(currentDate);
      });
      header.appendChild(resetBtn);
    }

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

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();

    // Number of days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const scheduledWeekdays = getScheduledWeekdays();

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

      // Get day of week for this date
      const dayOfWeek = new Date(year, month, day).getDay();

      // Highlight if scheduled weekday
      if (currentViewSchedule !== -1) {
        const schedule = schedules[currentViewSchedule];
        if (schedule.days.includes(dayOfWeek)) {
          dateCell.classList.add('selected');
          dateCell.style.backgroundColor = schedule.color;
        }
      } else {
        if (scheduledWeekdays.includes(dayOfWeek)) {
          // Find the first schedule that includes this dayOfWeek for color
          const matchingSchedule = schedules.find(sch => sch.days && sch.days.includes(dayOfWeek));
          dateCell.classList.add('selected');
          if (matchingSchedule && matchingSchedule.color) {
            dateCell.style.backgroundColor = matchingSchedule.color;
          }
        }
        // Preview highlight for currently selected weekdays (for adding/editing), only if not already highlighted as scheduled
        if (selectedWeekdays.includes(dayOfWeek) && !dateCell.classList.contains('selected')) {
          dateCell.classList.add('preview');
        }
      }

      datesGrid.appendChild(dateCell);
    }

    calendarContainer.appendChild(datesGrid);
  }

  function initializeWeekdayCheckboxes() {
    weekdayCheckboxes.forEach(checkbox => {
      checkbox.checked = selectedWeekdays.includes(parseInt(checkbox.value));
      checkbox.addEventListener('change', () => {
        const dayValue = parseInt(checkbox.value);
        if (checkbox.checked) {
          if (!selectedWeekdays.includes(dayValue)) {
            selectedWeekdays.push(dayValue);
          }
        } else {
          selectedWeekdays = selectedWeekdays.filter(d => d !== dayValue);
        }
        saveSelectedWeekdays();
        renderCalendar(currentDate);
      });
    });
  }

  addScheduleBtn.addEventListener('click', () => {
    const activity = scheduleActivityInput.value.trim();
    const days = [...selectedWeekdays];
    if (editingIndex === -1) {
      // Add new schedule
      const newColor = colors[schedules.length % colors.length];
      schedules.push({ activity, days, color: newColor });
    } else {
      // Update existing schedule
      const oldSchedule = schedules[editingIndex];
      schedules[editingIndex] = { activity, days, color: oldSchedule.color };
      editingIndex = -1;
      addScheduleBtn.textContent = 'Add Schedule';
    }
    saveSchedules();
    renderSchedules();
    renderCalendar(currentDate);
    scheduleActivityInput.value = '';
    selectedWeekdays = [];
    weekdayCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    saveSelectedWeekdays();
  });

  // Ensure all existing schedules have colors
  schedules.forEach((schedule, index) => {
    if (!schedule.color) {
      schedule.color = colors[index % colors.length];
    }
  });
  saveSchedules();

  initializeWeekdayCheckboxes();
  renderCalendar(currentDate);
  renderSchedules();
});
