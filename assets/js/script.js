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

  // check due date - this was added later when we are adding the functionality to have the color change based on the due date
  auditTask(taskLi);

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

  // added later to incorporate the select a date
  // enable jquery ui datepicker
  dateInput.datepicker({
    mindate: 1
  });

  // automatically focus on new element
  dateInput.trigger("focus");
});

// value of due date was changed.  used to be a blur event, but with the date picker, blur was changed to change
// value will update with the assistance of the dateInput.datepicker () function (on close)
$(".list-group").on("change", "input[type='text']", function() {
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

  // pass task's <li> element into auditTask() to check new due date  (this was added at the same time as the audit function)
  auditTask($(taskSpan).closest(".list-group-item"));
});

// ------------------------------------------ make  cards dragable and update ------------------------------------------
$(".card .list-group").sortable({
  connectWith: $(".card .list-group"), // this turns everything with in the class list-group into 
  // a sortable list.  The connectWith property then linked these sortable lists with any other lists that have the same class
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event) { // activate event triggers once for all connected lists as soon as the dragging starts
    console.log("activate", this);
  },
  deactivate: function(event) { // deactivate event triggers once for all connected lists as soon as the dragging ends
    console.log("deactiveate", this);
  },
  over: function(event) { // over event triggers when a dragged item enters a connected list (still not released though)
    console.log("over", event.target);
  },
  out: function(event) { // out event triggers when a dragged item leaves a connected list (still not released though)
    console.log("out", event.target);
  },
  update: function(event) { // update event triggers when the contents of a lost have changed (when item reordered, removed or added)
    // loop over current set of children in sortable list.

    // array to store the task data in
    var tempArr = [];
    
    // loop over currrent set of children in sortable list
    $(this).children().each(function() { // the children method returns an array of the list element's children (the li element), labeled as li.list-group-item
    // this loop will run a callback function for every item/element in the array.
    // the date and text will be saved in the variables.  This information will then be used to push to local storage
      var text = $(this) // $(this) refers to the child element at that index
        .find("p")
        .text()
        .trim();
      
      var date = $(this) // $(this) refers to the child element at that index
        .find("span")
        .text()
        .trim();
        
      // add task data to the temp array as an object
      tempArr.push( {
        text: text,
        date: date
      });
    });

    // trim down list's ID to match object property
    var arrName = $(this)
      .attr("id")
      .replace("list-", "");
    
    // update array on tasks object and save
    tasks[arrName] = tempArr;
    saveTasks();

    console.log(tempArr);
  }
});

// ------------------------------------------ Droppable Trash ------------------------------------------
$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui) { /// event triggered when draggable object is dropped
    console.log("drop");
    ui.draggable.remove(); // removes the DOM object.  works just like js remove()
  },
  over: function(event, ui) { // over event triggers when a dragged item enters a connected list (still not released though)
    console.log("over");
  },
  out: function(event, ui) { // triggered when draggable is dragged ober a droppable
    console.log("out");
  }
});

// ------------------------------------------ Date Picker ------------------------------------------
$("#modalDueDate").datepicker({
  minDate: 1, // makes it so that the date chosen must be at least one day away
  onClose: function() { // allows up to execute a function when the date picker closes.
    // when calendar is closed, force a "change" event on the `dateInput`
    $(this).trigger("change");
  }
});

// ------------------------------------------ Audit Task for Due Date (color change) ------------------------------------------
var auditTask = function(taskEl) {
  // get date from task element
  var date = $(taskEl).find("span").text().trim();
 
  // convert the moment object at 5:00pm of whatever the date is (this will become a cut off point)
  var time = moment(date, "L").set("hour", 17);
  // this should print out an object for the value of the date variable, but at 5:00pm of that date
  
  // remove any old classes from element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

  // apply new class if task is near/over due date
  if (moment().isAfter(time)) { // query method - this performs a single true or false check on the data to gather more information about it
    // isAfter gets the current time from moment() and checks it that values comes later than the value of the time variable
    $(taskEl).addClass("list-group-item-danger");
  }
  else if (Math.abs(moment().diff(time, "days")) <= 2) { // if the date difference is less than or equal to 2 days away, then a warning color is issued.
    $(taskEl).addClass("list-group-item-warning");
  }
};







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


