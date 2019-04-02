var ENTER_KEY = 13;
var ESCAPE_KEY = 27;

var util = {
  uuid: function () {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = Math.random() * 16 | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
  },

  store: function (namespace, data) {
    if (arguments.length > 1) {
      return localStorage.setItem(namespace, JSON.stringify(data));
    } else {
      var store = localStorage.getItem(namespace);
      return (store && JSON.parse(store)) || [];
    }
  }
};

var App = {

init: function() {
  this.todos = util.store('todos');
  this.todoTemplate = Handlebars.compile(document.querySelector("#todo-template").innerHTML);
  this.events();
  this.render();
},

events: function() {
  var todoList = document.querySelector('#main-tree');
  todoList.addEventListener('click', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'destroy') {
      App.destroy(e);
    }
  })
  todoList.addEventListener('change', function(e) {
    var elementClicked = event.target;
    if (elementClicked.className === 'toggle') {
      App.toggle(e);
    }
  })
  todoList.addEventListener('click', function(e) {
    var elClicked = event.target;
    if (elClicked.nodeName === 'LABEL') {
      App.edit(e);
    }
  })
  todoList.addEventListener('keyup', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'editing') {
      App.editKeyup(e);
    }
  })
  todoList.addEventListener('focusout', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'editing') {
      App.update(e);
    }
  })
  todoList.addEventListener('click', function(e) {
    var el = event.target;
    if (el.nodeName === 'A');
    App.anchorHandler(e);
  })
},
newInputEvent: function() {
  var callCreate = window.callCreate = function(e) {
    App.create(e);
  }
  var newSubInput = document.getElementById('new-input');
  var newInput = document.getElementById('first-input');
  if (newInput) {
    newInput.addEventListener('keyup', callCreate);
    newInput.focus();
  }else {
    newSubInput.addEventListener('keyup', callCreate);
    newSubInput.focus();
  }
},
render: function() {
  var todos = this.todos;
  util.store('todos', this.todos);
  this.whatToRender();
},
anchorHandler: function(e) {
  var ul = document.getElementById('main-tree');
  var li = e.target.closest('li');
  var input = document.getElementById('subInput');
  input.className = 'show';
},
//first input or existing todos...
whatToRender: function() {
  var ul = document.getElementById('main-tree');
  while (ul.firstChild) {
      ul.removeChild(ul.firstChild);
  }
  if (this.todos.length === 0) {
    // var ul = document.getElementById('main-tree');
    var li = document.createElement('li');
    var div = document.createElement('div');
    var a = document.createElement('a');
    var input = document.createElement('input');
    var destroy = document.createElement('button');
    var toggle = document.createElement('input');

    div.className = 'same-row';
    destroy.setAttribute('type', 'button');
    destroy.className = 'hideVis';
    destroy.innerText = 'X';
    toggle.setAttribute('type', 'checkbox');
    toggle.className = 'hideVis';
    a.innerText = '•';
    a.setAttribute('id', 'first-a');
    input.setAttribute('style', 'text');
    input.setAttribute('placeholder', 'What\'d ya got?')
    input.className = 'show';
    input.setAttribute('id', 'first-input');
    input.setAttribute('autofocus', 'autofocus');

    ul.appendChild(li);
    li.appendChild(div);
    div.appendChild(destroy);
    div.appendChild(toggle);
    div.appendChild(a);
    li.appendChild(input);
  }else {
    document.getElementById('main-tree').innerHTML = (this.todoTemplate(this.todos));
  }
  this.newInputEvent();
},
// accepts an element from inside the `.item` div and
// returns the corresponding index in the `todos` array
indexFromEl: function (el) {
  //var id = $(el).closest('li').data('id');
  var preId = el.closest('li');
  var id = preId.getAttribute('data-id');
  var todos = this.todos;
  var i = todos.length;

  while (i--) {
    if (todos[i].id === id) {
      return i;
    }
  }
},
create: function (e) {
  var input = e.target;
  var val = input.value;

  if (e.which !== ENTER_KEY) {
      return;
  }

  this.todos.push({
    id: util.uuid(),
    title: val,
    completed: false,
    subTree: false,
    subArray: []

  });

  input.value = '';

  this.render();
},
toggle: function (e) {
  var i = this.indexFromEl(e.target);
  this.todos[i].completed = !this.todos[i].completed;
  this.render();
},
edit: function (e) {
  subInput = document.getElementById('sub-input');
  if (subInput) {
    subInput.remove();
  }
  var li = e.target.closest('li');
  var input = li.firstElementChild.nextElementSibling;
  var label = e.target.closest('label');
  var labelText = label.innerText;
  label.className = 'hidden';
  input.className = 'editing';
  input.setAttribute('value', labelText);
  input.focus();
  var val = input.getAttribute('value');
  input.value = '';
  input.value = val;
  var destroy = li.firstElementChild.firstElementChild;
  var toggle = destroy.nextElementSibling;
  destroy.className = 'hideDestroy';
  toggle.className = 'hideVis';
},
editKeyup: function (e) {
  var todoList = document.getElementById('main-tree');
  if (e.which === ENTER_KEY) {
    e.target.blur();
  }

  if (e.which === ESCAPE_KEY) {
    //$(e.target).data('abort', true).blur();
    e.target.setAttribute('abort', 'true');
    e.target.blur();
  }
},
update: function (e) {
  var el = e.target;
  var val = el.value;

  if (!val) {
    this.destroy(e);
    return;
  }

  if (el.getAttribute('abort') === 'true') {
    el.setAttribute('abort', 'false');
  } else {
    this.todos[this.indexFromEl(el)].title = val;
  }

   this.render();
},
destroy: function (e) {
  this.todos.splice(this.indexFromEl(e.target), 1);
  this.render();
}
//</app>
}
App.init();
