// Grading page JavaScript
// To enable email sending for grades submission:
// 1. Sign up at https://www.emailjs.com/
// 2. Create a service (e.g., Gmail)
// 3. Create an email template with placeholders: {{to_email}}, {{subject}}, {{grades_list}}, {{teacher}}
// 4. Replace 'YOUR_PUBLIC_KEY_HERE', 'YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID' with actual values
// 5. Update 'registrar@school.com' with the actual recipient email

let currentUser = localStorage.getItem('currentUser');
if (!currentUser) {
  location.href = 'index.html';
}

/**
 * Initialize EmailJS with your actual public key from EmailJS dashboard.
 * Make sure to replace the placeholders below with your real EmailJS credentials.
 */
emailjs.init('JsWIc7UIhG7NXJZMJy');

const studentTypeSelect = document.getElementById('student-type');
const collegeFields = document.getElementById('college-fields');
const elementaryFields = document.getElementById('elementary-fields');
const courseInput = document.getElementById('course');
const sectionInput = document.getElementById('section');
const studentNameInput = document.getElementById('student-name');
const studentGradeInput = document.getElementById('student-grade');
const addStudentBtn = document.getElementById('add-student-btn');
const submitGradesBtn = document.getElementById('submit-grades-btn');
const gradeListDiv = document.getElementById('grade-list');

let tempGrades = {}; // Object with keys as course names or 'elementary'
let currentCourse = 'bscs'; // Default course for college

// Load saved grades from localStorage on page load (per-user key to persist across logouts)
window.addEventListener('load', () => {
  const savedGrades = JSON.parse(localStorage.getItem(`grades_${currentUser}`)) || [];
  tempGrades = {};
  // Distribute saved grades into tempGrades by course or 'elementary'
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
  renderList(gradeListDiv, tempGrades[currentCourse] || [], formatGradeItem);
});

studentTypeSelect.addEventListener('change', () => {
  const gradingPeriodSelect = document.getElementById('grading-period');
  gradingPeriodSelect.innerHTML = '';
  if (studentTypeSelect.value === 'college') {
    collegeFields.style.display = 'block';
    elementaryFields.style.display = 'none';
    document.getElementById('grading-period-container').style.display = 'block';
    ['First Sem', 'Second Sem', 'First&Second Sem'].forEach(period => {
      const option = document.createElement('option');
      option.value = period.toLowerCase().replace(/&/g, 'and').replace(/ /g, '-');
      option.textContent = period;
      gradingPeriodSelect.appendChild(option);
    });
    currentCourse = courseInput.value || 'bscs';
  } else if (studentTypeSelect.value === 'elementary') {
    collegeFields.style.display = 'none';
    elementaryFields.style.display = 'block';
    document.getElementById('grading-period-container').style.display = 'block';
    ['First Grading', 'Second Grading', 'Third Grading', 'Fourth Grading'].forEach(period => {
      const option = document.createElement('option');
      option.value = period.toLowerCase().replace(' ', '-');
      option.textContent = period;
      gradingPeriodSelect.appendChild(option);
    });
    currentCourse = 'elementary';
  } else {
    document.getElementById('grading-period-container').style.display = 'none';
    currentCourse = '';
  }
  renderList(gradeListDiv, tempGrades[currentCourse] || [], formatGradeItem);
  updateGradeInputs();
});

document.getElementById('grading-period').addEventListener('change', () => {
  updateGradeInputs();
});

document.getElementById('course').addEventListener('change', (e) => {
  currentCourse = e.target.value;
  renderList(gradeListDiv, tempGrades[currentCourse] || [], formatGradeItem);
});

function renderList(container, items, formatFn) {
  const tbody = container.querySelector('tbody');
  tbody.innerHTML = '';
  if (items.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 6;
    td.textContent = 'No students added yet.';
    td.style.textAlign = 'center';
    td.style.fontStyle = 'italic';
    td.style.color = '#33691e';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }
  items.forEach(item => {
    const tr = document.createElement('tr');
    const data = formatFn(item);
    data.forEach((cellData, index) => {
      const td = document.createElement('td');
      if (index === 4) {
        const btn = document.createElement('button');
        btn.textContent = cellData;
        btn.className = 'btn btn-remove';
        btn.addEventListener('click', () => removeGrade(item));
        td.appendChild(btn);
      } else if (index === 5) {
        const btn = document.createElement('button');
        btn.textContent = cellData;
        btn.className = 'btn btn-edit';
        btn.addEventListener('click', () => editGrade(item));
        td.appendChild(btn);
      } else {
        td.textContent = cellData;
      }
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

submitGradesBtn.addEventListener('click', () => {
  const grades = tempGrades[currentCourse];
  if (!grades || grades.length === 0) {
    alert('No grades to submit.');
    return;
  }

  // Format grades for email
  const gradesList = grades.map(grade =>
    `Student: ${grade.student}, Grading Period: ${grade.gradingPeriod}, Details: ${grade.studentType === 'college' ? `Course: ${grade.course}` : `Section: ${grade.section}`}, Grade: ${grade.grade}`
  ).join('\n');

  const recipientEmail = document.getElementById('recipient-email').value.trim();
  if (!recipientEmail) {
    alert('Please enter a recipient email address.');
    return;
  }

  const templateParams = {
    to_email: recipientEmail,
    subject: `Grades Submitted for ${currentCourse === 'elementary' ? 'Elementary' : currentCourse.toUpperCase()}`,
    grades_list: gradesList,
    teacher: currentUser || 'Teacher'
  };

  // Send email using EmailJS
  emailjs.send('service_pnmi1ws', 'template_pnmi1ws', templateParams, 'JsWIc7UIhG7NXJZMJy')
    .then(() => {
      // Save grades to localStorage only after successful email sending
      const existing = JSON.parse(localStorage.getItem(`grades_${currentUser}`)) || [];
      existing.push(...grades);
      localStorage.setItem(`grades_${currentUser}`, JSON.stringify(existing));

      alert('Grades submitted successfully! Email sent.');
      tempGrades[currentCourse] = [];
      renderList(gradeListDiv, tempGrades[currentCourse], formatGradeItem);
    })
    .catch((error) => {
      alert('Failed to send email. Please try again later.');
      console.error('EmailJS error:', error);
    });
});

  // Save grades to localStorage on add student to persist immediately
function saveGradesToStorage() {
  const allGrades = Object.values(tempGrades).flat();
  localStorage.setItem(`grades_${currentUser}`, JSON.stringify(allGrades));
}

// Add student event to save grades immediately
addStudentBtn.addEventListener('click', () => {
  const studentType = studentTypeSelect.value;
  const student = studentNameInput.value.trim();
  const gradingPeriod = document.getElementById('grading-period').value;
  let course = '';
  let section = '';
  let grade = '';

  // Validate grading period
  if (!gradingPeriod) {
    alert('Please select a grading period.');
    return;
  }

  // Validate course or section based on student type
  if (studentType === 'college') {
    course = courseInput.value;
    if (!course) {
      alert('Please select a course.');
      return;
    }
    currentCourse = course;
  } else if (studentType === 'elementary') {
    section = sectionInput.value.trim();
    if (!section) {
      alert('Please enter the section.');
      return;
    }
    currentCourse = 'elementary';
  }

  // Validate grades input and ensure numeric and between 0-100
  if (gradingPeriod === 'firstandsecond-sem') {
    const grade1Input = document.getElementById('student-grade-1');
    const grade2Input = document.getElementById('student-grade-2');
    const grade1 = grade1Input.value.trim();
    const grade2 = grade2Input.value.trim();

    if (!grade1 || !grade2) {
      alert('Please enter both grades.');
      return;
    }
    if (isNaN(grade1) || isNaN(grade2) || grade1 < 0 || grade1 > 100 || grade2 < 0 || grade2 > 100) {
      alert('Grades must be numbers between 0 and 100.');
      return;
    }
    grade = `${grade1}, ${grade2}`;
  } else {
    const gradeInputCurrent = document.getElementById('student-grade');
    grade = gradeInputCurrent ? gradeInputCurrent.value.trim() : '';
    if (!grade) {
      alert('Please enter a grade.');
      return;
    }
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert('Grade must be a number between 0 and 100.');
      return;
    }
  }

  // Validate student name
  if (!student) {
    alert('Please enter student name.');
    return;
  }

  if (!tempGrades[currentCourse]) tempGrades[currentCourse] = [];
  tempGrades[currentCourse].push({ studentType, student, grade, course, section, gradingPeriod });
  renderList(gradeListDiv, tempGrades[currentCourse], formatGradeItem);

  // Save grades immediately to localStorage
  saveGradesToStorage();

  // Clear inputs
  studentNameInput.value = '';
  sectionInput.value = '';
  if (gradingPeriod === 'firstandsecond-sem') {
    document.getElementById('student-grade-1').value = '';
    document.getElementById('student-grade-2').value = '';
  } else {
    const gradeInputCurrent = document.getElementById('student-grade');
    if (gradeInputCurrent) gradeInputCurrent.value = '';
  }
});

function formatGradeItem(item) {
  const details = item.studentType === 'college' ? `Course: ${item.course}` : item.studentType === 'elementary' ? `Section: ${item.section}` : '';
  return [item.student, item.gradingPeriod, details, item.grade, 'Remove', 'Edit'];
}

function removeGrade(item) {
  const index = tempGrades[currentCourse].indexOf(item);
  if (index > -1) {
    tempGrades[currentCourse].splice(index, 1);
    renderList(gradeListDiv, tempGrades[currentCourse], formatGradeItem);
    saveGradesToStorage();
  }
}

function editGrade(item) {
  // Populate form fields with the selected grade data for editing
  studentTypeSelect.value = item.studentType;
  if (item.studentType === 'college') {
    collegeFields.style.display = 'block';
    elementaryFields.style.display = 'none';
    courseInput.value = item.course;
  } else {
    collegeFields.style.display = 'none';
    elementaryFields.style.display = 'block';
    sectionInput.value = item.section;
  }
  document.getElementById('grading-period').value = item.gradingPeriod;
  studentNameInput.value = item.student;
  updateGradeInputs();
  if (item.gradingPeriod === 'firstandsecond-sem') {
    const grades = item.grade.split(',').map(g => g.trim());
    const gradeInput1 = document.getElementById('student-grade-1');
    const gradeInput2 = document.getElementById('student-grade-2');
    gradeInput1.value = grades[0] || '';
    gradeInput2.value = grades[1] || '';
    gradeInput1.classList.add('edit-mode');
    gradeInput2.classList.add('edit-mode');
  } else {
    const gradeInput = document.getElementById('student-grade');
    gradeInput.value = item.grade;
    gradeInput.classList.add('edit-mode');
  }

  // Remove the old entry from the list to avoid duplicates on save
  removeGrade(item);

  // Do not change the background color of the list rows when editing
  // So no code here to change row background color
}

// Remove edit mode styles when adding a new student
addStudentBtn.addEventListener('click', () => {
  studentNameInput.classList.remove('edit-mode');
  sectionInput.classList.remove('edit-mode');
  const gradeInput1 = document.getElementById('student-grade-1');
  const gradeInput2 = document.getElementById('student-grade-2');
  if (gradeInput1) gradeInput1.classList.remove('edit-mode');
  if (gradeInput2) gradeInput2.classList.remove('edit-mode');
  const gradeInput = document.getElementById('student-grade');
  if (gradeInput) gradeInput.classList.remove('edit-mode');
});

// Initial render
renderList(gradeListDiv, tempGrades[currentCourse] || [], formatGradeItem);

  
// Trigger initial change to show grading period for default student type
studentTypeSelect.dispatchEvent(new Event('change'));

  
  
  
function updateGradeInputs() {
  const gradingPeriod = document.getElementById('grading-period').value;
  const gradeInputContainer = document.getElementById('grade-input-container');
  gradeInputContainer.innerHTML = '';

  if (gradingPeriod === 'firstandsecond-sem') {
    // Show two grade inputs
    const label = document.createElement('label');
    label.className = 'block font-semibold text-green-700 mb-1';
    label.textContent = 'Grades:';

    const input1 = document.createElement('input');
    input1.type = 'number';
    input1.id = 'student-grade-1';
    input1.className = 'form-control w-full border border-green-400 rounded px-3 py-2 mb-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
    input1.placeholder = 'Enter first grade';
    input1.min = '0';
    input1.max = '100';

    const input2 = document.createElement('input');
    input2.type = 'number';
    input2.id = 'student-grade-2';
    input2.className = 'form-control w-full border border-green-400 rounded px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
    input2.placeholder = 'Enter second grade';
    input2.min = '0';
    input2.max = '100';

    gradeInputContainer.appendChild(label);
    gradeInputContainer.appendChild(input1);
    gradeInputContainer.appendChild(input2);
  } else {
    // Show single grade input
    const label = document.createElement('label');
    label.className = 'block font-semibold text-green-700 mb-1';
    label.htmlFor = 'student-grade';
    label.textContent = 'Grade:';

    const input = document.createElement('input');
    input.type = 'number';
    input.id = 'student-grade';
    input.className = 'form-control w-full border border-green-400 rounded px-3 py-2 shadow-sm transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent';
    input.placeholder = 'Enter grade';
    input.min = '0';
    input.max = '100';

    gradeInputContainer.appendChild(label);
    gradeInputContainer.appendChild(input);
  }
}

