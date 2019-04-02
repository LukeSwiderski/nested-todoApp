var ENTER_KEY = 13;
var ESCAPE_KEY = 27;
var BACKSPACE_KEY = 8;

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
  window.mainSection = document.getElementById('mainSection');
  this.todos = util.store('todos');;
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
    if (elClicked.className === 'edit') {
      App.editKeyup(e);
    }
  })
  todoList.addEventListener('focusout', function(e) {
    var elClicked = event.target;
    if (elClicked.className === 'edit') {
      App.update(e);
    }
  })
  todoList.addEventListener('keyup', function(e) {
    if (event.target = document.querySelector('input')) {
      App.backspaceReturnFocus(e);
    }
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
backspaceReturnFocus: function(e) {
  var subInput = document.getElementById('new-input');
  var ul = document.getElementById('main-tree');
  var li = e.target.closest('li');
  var val = e.target.value.trim();
  if (this.todos.length === 0) {
    return;
  }else {
    if (e.which === BACKSPACE_KEY && !val) {
        li.remove();
        var destroy = ul.lastChild.firstChild.firstChild;
        var toggle =  destroy.nextSibling;
        var input = ul.lastChild.lastChild;
        var label = ul.lastChild.firstChild.lastChild;
        var labelText = label.innerText;
        destroy.className = 'hideDestroy';
        toggle.className = 'hideVis';
        label.className = 'hidden';
        input.className = 'edit';
        input.setAttribute('value', labelText);
        input.focus();
        var val = input.getAttribute('value');
        input.value = '';
        input.value = val;
    }
  }
},
render: function() {
  var todos = this.todos;
  util.store('todos', this.todos);
  this.whatToRender();
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
    div.appendChild(input);
    this.newInputEvent();
  }else {
    this.todoTemplate(this.todos);
  }
},
todoTemplate: function(todos) {
   var ul = document.getElementById('main-tree');

  todos.forEach(function(todo, index, array) {
    var div = window['div' + todo.id] = document.createElement('div');
    var a = document.createElement('a');
    var li = document.createElement('li');
    var label = document.createElement('label');
    var input = document.createElement('input');
    var destroy = document.createElement('button');
    var toggle = document.createElement('input');

    li.setAttribute('data-id', todo.id);
    div.className = 'same-row';
    destroy.setAttribute('type', 'button');
    destroy.className = 'destroy';
    destroy.innerText = 'X';
    toggle.setAttribute('type', 'checkbox');
    toggle.className = 'toggle';
    a.innerText = '•';
    input.setAttribute('style', 'text');
    input.setAttribute('value', todo.title);
    input.className = 'hidden';
    label.innerText = todo.title;

    li.appendChild(div);
    div.appendChild(destroy);
    div.appendChild(toggle);
    div.appendChild(a)
    div.appendChild(label);
    li.appendChild(input);
    ul.appendChild(li);

    if (label.innerText.length === 0) {
      input.className = 'edit';
    }

    if (todo.completed === true) {
      toggle.checked = true;
      label.className = 'completed';
    }else {
      toggle.checked === false;
    }

  })
  this.createSubInput();
},
//if there already is a subInput, delete it.
createSubInput: function() {
  var newInput = document.getElementById('new-input');
  if (newInput === null) {
    //create the always present new input to add to list
    var ul = document.getElementById('main-tree');
    var subLi = document.createElement('li');
    var subDiv = document.createElement('div');
    var subA = document.createElement('a');
    var subInput = document.createElement('input');
    var subLabel = document.createElement('label');
    var toggle = document.createElement('input');
    var destroy = document.createElement('button');

    subDiv.className = 'same-row';
    toggle.setAttribute('type', 'checkbox');
    toggle.className = 'hideVis';
    destroy.setAttribute('type', 'button');
    destroy.className = 'hideDestroy';
    destroy.innerText = 'X';
    subInput.setAttribute('style', 'text');
    subInput.setAttribute('id', 'new-input');
    subInput.setAttribute('autofocus', 'autofocus');
    subInput.className = 'show';
    subA.innerText = '•';

    subLi.appendChild(subDiv);
    subDiv.appendChild(destroy);
    subDiv.appendChild(toggle);
    subDiv.appendChild(subA);
    subDiv.appendChild(subA);
    subLi.appendChild(subInput);
    ul.appendChild(subLi);
    this.newInputEvent();
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
    var ul = document.getElementById('main-tree');
    subInput = document.getElementById('new-input');
    if (subInput) {
      subInput.remove();
    }
    var li = e.target.closest('li');
    var input = li.lastChild;
    var label = li.firstChild.lastChild;
    var labelText = label.innerText;
    var destroy = li.firstChild.firstChild;
    var toggle = destroy.nextSibling;
    destroy.className = 'hideDestroy';
    toggle.className = 'hideVis';
    label.className = 'hidden';
    input.className = 'edit';
    input.setAttribute('value', labelText);
    input.focus();
    //the following sets the cursor to the end of the value upon focus instead of the front.
    var val = input.getAttribute('value'); //store the value of the element
    input.value = ''; //clear the value of the element
    input.value = val; //set that value back.
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
