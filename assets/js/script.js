var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(taskDate);
  var taskP = $("<p>")
    .addClass("m-1")
    .text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);


  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr); lesson 5.1.5 said to comment
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};

var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// ------------------------------------------ Edit task text ------------------------------------------
// added in 5.1.6 to make it so every time p is clicked, a function runs
// when the parapraph element of a task is clicked, it becomes editable.  Focus will appear around the element
$(".list-group").on("click", "p", function() {
  // console.log(this); // 'this' refers to the actual elements that are clicked on.  would show whatevver the <p> element test is
  var text = $(this)
    .text()
    .trim();
  
  var textInput = $("<textarea>") // tells Jquery to find all existing <textarea> elements
    .addClass("form-control")
    .val(text);
  $(this).replaceWith(textInput); // turns the clicked on area into a text input
  textInput.trigger("focus"); // adds emphasis around the text area
});

// when you click off of the recently edited paragraph with the focus, the edited text will be saved.  Once focus is gone, save
$(".list-group").on("blur", "textarea", function() { // blur event will trigger as soon as the user interacts with anything other that the text area element
  // get the textarea's current value/text
  var text = $(this)
    .val()
    .trim();
  
  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id") // this will return the ID, which will be "list-" followed by the category.  Then the replace() is run to update
    .replace("list-", ""); // reguar js operator.  finds and replaces text in a string
  
  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index(); // index function from jquery indexes just like arrays, starting from 0
  
  // we want to update the overarching tasks object with the new data
  tasks[status][index].text = text; // tasks is the object / tasks[status] returns an array (ie: toDo) / 
  //console.log(tasks);
  // tasks[status][index] returns the object at a given index in the array / tasks[status][index].text returns the text property
  saveTasks();

  // recreate p element
  var taskP = $("<p>")
  .addClass("m-1")
  .text(text);

  // replace textarea with p element
  $(this).replaceWith(taskP);
});

// ------------------------------------------ Edit task date ------------------------------------------
// very similar to editing the <p> element above
// due date was clicked
$(".list-group").on("click", "span", function() {
  // get current text
  var date = $(this)
    .text()
    .trim();

  // create new input element
  var dateInput = $("<input>")
    .attr("type", "text")
    .addClass("form-control")
    .val(date);

  // swap out elements
  $(this).replaceWith(dateInput);

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
  // get current text
  var date = $(this)
    .val()
    .trim();

  // get the parent ul's id attribute
  var status = $(this)
    .closest(".list-group")
    .attr("id")
    .replace("list-", "");

  // get the task's position in the list of other li elements
  var index = $(this)
    .closest(".list-group-item")
    .index();

  // update task in array and re-save to localstorage
  tasks[status][index].date = date;
  saveTasks();

  // recreate span element with bootstrap classes
  var taskSpan = $("<span>")
    .addClass("badge badge-primary badge-pill")
    .text(date);

  // replace input with span element
  $(this).replaceWith(taskSpan);
});


// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});

// load tasks for the first time
loadTasks();


