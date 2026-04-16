export function refreshGrades() {
  const gradeListDiv = document.getElementById('grade-list');
  const studentTypeSelect = document.getElementById('student-type');
  const courseInput = document.getElementById('course');
  const currentUser = localStorage.getItem('currentUser');

  let tempGrades = {};
  const savedGrades = JSON.parse(localStorage.getItem(`all_grades_${currentUser}`)) || [];
  savedGrades.forEach(gradeEntry => {
    let key;
    if (gradeEntry.studentType === 'college') {
      key = gradeEntry.course;
    } else {
      key = 'elementary';
    }
    if (!tempGrades[key]) tempGrades[key] = [];
    tempGrades[key].push(gradeEntry);
  });

  // Determine currentCourse based on student type and course selection
  let currentCourse = '';
  if (studentTypeSelect.value === 'college') {
    currentCourse = courseInput.value || 'bscs';
  } else if (studentTypeSelect.value === 'elementary') {
    currentCourse = 'elementary';
  }

  // Refresh the list for the current course/section without removing students
  function formatGradeItem(item) {
    const details = item.studentType === 'college' ? `Course: ${item.course}` : item.studentType === 'elementary' ? `Section: ${item.section}` : '';
    return [item.student, item.gradingPeriod, details, item.grade, 'Remove'];
  }

  // Clear the grade list table body before rendering
  const tbody = gradeListDiv.querySelector('tbody');
  tbody.innerHTML = '';

  // Rebuild the list from localStorage data
  if (tempGrades[currentCourse] && tempGrades[currentCourse].length > 0) {
    renderList(gradeListDiv, tempGrades[currentCourse], formatGradeItem);
  } else {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 5;
    td.textContent = 'No students added yet.';
    td.style.textAlign = 'center';
    td.style.fontStyle = 'italic';
    td.style.color = '#33691e';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  // Helper renderList function (copied from grading.js for modularity)
  function renderList(container, items, formatFn) {
    const tbody = container.querySelector('tbody');
    items.forEach(item => {
      const tr = document.createElement('tr');
      const data = formatFn(item);
      data.forEach((cellData, index) => {
        const td = document.createElement('td');
        if (index === 4) {
          const btn = document.createElement('button');
          btn.textContent = cellData;
          btn.className = 'btn btn-danger btn-sm';
          btn.addEventListener('click', () => removeGrade(item));
          td.appendChild(btn);
        } else {
          td.textContent = cellData;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }
}

// Function to remove a grade (copied from grading.js)
function removeGrade(item) {
  const studentTypeSelect = document.getElementById('student-type');
  const courseInput = document.getElementById('course');
  const currentUser = localStorage.getItem('currentUser');
  let currentCourse = '';
  if (studentTypeSelect.value === 'college') {
    currentCourse = courseInput.value || 'bscs';
  } else if (studentTypeSelect.value === 'elementary') {
    currentCourse = 'elementary';
  }

  let tempGrades = {};
  let savedGrades = JSON.parse(localStorage.getItem(`all_grades_${currentUser}`)) || [];
  if (savedGrades.length === 0) {
    const oldGrades = JSON.parse(localStorage.getItem('all_grades')) || [];
    if (oldGrades.length > 0) {
      localStorage.setItem(`all_grades_${currentUser}`, JSON.stringify(oldGrades));
      localStorage.removeItem('all_grades');
      savedGrades = oldGrades;
    }
  }
  savedGrades.forEach(gradeEntry => {
    let key;
    if (gradeEntry.studentType === 'college') {
      key = gradeEntry.course;
    } else {
      key = 'elementary';
    }
    if (!tempGrades[key]) tempGrades[key] = [];
    tempGrades[key].push(gradeEntry);
  });

  const index = tempGrades[currentCourse].indexOf(item);
  if (index > -1) {
    tempGrades[currentCourse].splice(index, 1);
    saveGradesToStorage(tempGrades);
    renderList(gradeListDiv, tempGrades[currentCourse], formatGradeItem);
  }
}

// Function to save grades to localStorage
function saveGradesToStorage(tempGrades) {
  const currentUser = localStorage.getItem('currentUser');
  const allGrades = Object.values(tempGrades).flat();
  localStorage.setItem(`all_grades_${currentUser}`, JSON.stringify(allGrades));
}
