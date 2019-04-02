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
  this.lastActiveElement = document.querySelector('input');
  window.ul = document.getElementById('main-tree');
  this.events();
  this.render();
},
events: function() {
  var todoList = document.querySelector('#main-tree');
  todoList.addEventListener('click', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'destroy') {
      App.destroy(e);
      document.querySelector('input').blur;
    }
  })
  todoList.addEventListener('click', function(e) {
    var elementClicked = event.target;
    if (elementClicked.className === 'toggle') {
      App.toggle(e);
      document.querySelector('input').blur;
    }
  })
  todoList.addEventListener('change', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'edit') {
      App.edit(e);
    }
  })
  todoList.addEventListener('keyup', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'edit') {
      App.edit(e);
    }
  })
  todoList.addEventListener('click', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'edit') {
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
  todoList.addEventListener('keyup', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'editing') {
      App.create(e);
    }
  })
},
render: function() {
  if (this.todos.length === 0) {
    this.todos.push({
      id: util.uuid(),
      title: "",
      completed: false,
      subTree: false,
      subArray: []
    })
  }
  util.store('todos', this.todos);
  document.getElementById('main-tree').innerHTML = (this.todoTemplate(this.todos));
  this.whereToFocus();
},
whereToFocus: function() {
  var ul = document.getElementById('main-tree');
  if (this.todos.length === 1) {
    document.querySelector('input').focus();
  }else{
      var lastElementNodeIndex = this.nodeIndexGetter();
      ul.childNodes[lastElementNodeIndex + 2].lastElementChild.focus();
  }
},
nodeIndexGetter: function() {
  var ul = document.getElementById('main-tree');
  var i = ul.childNodes.length;
  var li = this.lastActiveElement.closest('li');

  while (i--) {
    if (ul.childNodes[i].nodeName === 'LI') {
      if (ul.childNodes[i].getAttribute('data-id') === li.getAttribute('data-id')) {
        return i;
      }
    }
  }
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
  var index = (this.indexFromEl(input)) + 1;
  this.lastActiveElement = input;


  if (e.which !== ENTER_KEY) {
      return;
  }

  this.todos.splice(index, 0, {
    id: util.uuid(),
    title: '',
    completed: false,
    subTree: false,
    subArray: []

  });
  this.render();
},
toggle: function (e) {
  var i = this.indexFromEl(e.target);
  this.todos[i].completed = !this.todos[i].completed;
  this.render();
},
edit: function (e) {
  if (e.which !== ENTER_KEY) {
    return;
  }
  var li = e.target.closest('li');
  var input = li.lastElementChild;
  input.className = 'editing';
  input.focus();
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

  // if (!val) {
  //   this.destroy(e);
  //   return;
  // }

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
