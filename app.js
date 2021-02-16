var ENTER_KEY = 13;

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
    var ul = window.ul = document.getElementById('main-tree');
    this.events();
    this.render();
    //lastActiveInput stores a data- id.  It is updated by create, subPusher and update functions, to keep track of focus.
    //it defaults to the last todo in case it's previous value has been deleted by user.
    //Here it is set to the first todo, upon init.
    this.lastActiveInput = this.todos[0].id;
  },
  
  events: function() {
    var todoList = document.querySelector('#main-tree');
    todoList.addEventListener('click', function(e) {
      var elClicked = event.target;
      if (elClicked.className === 'destroy') {
        App.destroy(e);
      }
    })
    todoList.addEventListener('click', function(e) {
      var elementClicked = event.target;
      if (elementClicked.className === 'toggle') {
        App.toggle(e);
      }
    })
    todoList.addEventListener('keyup', function(e) {
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
    todoList.addEventListener('click', function(e) {
      var elClicked = event.target;
      if (elClicked.className === 'sub-todo') {
        App.createSubTodo(e);
      }
    })
  },

  todoTemplate: function(todo) {
    var listItem = document.createElement('li');
    listItem.setAttribute('data-id', todo.id)
    var dropDown = document.createElement('div');
    dropDown.className = "dropdown";
    listItem.appendChild(dropDown);
    var dropButton = document.createElement('a');
    dropButton.className = "dropbtn";
    dropButton.innerHTML = "•";
    dropDown.appendChild(dropButton);
    var dropContent = document.createElement('div');
    dropContent.className = "dropdown-content";
    dropDown.appendChild(dropContent);
    var subTodo = document.createElement('a');
    subTodo.className = "sub-todo";
    subTodo.innerHTML = "Add Sub-Todo";
    dropContent.appendChild(subTodo);
    var toggle = document.createElement('a');
    toggle.className = "toggle";
    toggle.innerHTML = "Mark Completed";
    dropContent.appendChild(toggle);
    var destroy = document.createElement('a');
    destroy.className = "destroy";
    destroy.innerHTML = "Delete";
    dropContent.appendChild(destroy);
    var input = document.createElement('input');
    input.setAttribute("value", todo.title);
    input.setAttribute('focus-id', todo.id);
    if (todo.completed === true) {
    input.className = "completed";
    }else {
    input.className = "editing"
    }
    listItem.appendChild(input);
    return listItem;
  },

  render: function() {
    if (this.todos.length === 0) {
      this.todos.push({
        id: util.uuid(),
        title: "",
        completed: false,
        subArray: false,
      })
    }
    util.store('todos', this.todos);
    ul.replaceChildren();
    this.todos.forEach(function(todo, index, array) {
       ul.appendChild(this.todoTemplate(todo));
    }, this)
    this.renderSubs(this.todos);
    this.whereToFocus();
  },

  renderSubs: function(obj) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].subArray) {
        var id = obj[i].id;
        var liSelectorString = 'li' + '[data-id=' + '"' + id + '"' + ']';
        var li = document.querySelector(liSelectorString);
        var newUl = document.createElement('ul');
        li.appendChild(newUl);
        newUl.setAttribute('data-id', id);
        obj[i].subArray.forEach(function(todo, index, array) {
            newUl.appendChild(this.todoTemplate(todo));
        }, this), 
        newUl.style.marginLeft = '2%';
        this.renderSubs(obj[i].subArray);
      }
    }
  },

  whereToFocus: function() {
      var selectorString = 'input' + '[focus-id=' + '"' + this.lastActiveInput +'"' + ']';
      var input = document.querySelector(selectorString);
      if (input !== null) {
        input.focus();
        var val = input.getAttribute('value');
        input.value = '';
        input.value = val;
      }else {
        var lastTodoId = this.todos[this.todos.length - 1].id;
        var lastTodoSelectorString = 'input' + '[focus-id=' + '"' + lastTodoId +'"' + ']';
        input = document.querySelector(lastTodoSelectorString);
        input.focus();
        var val = input.getAttribute('value');
        input.value = '';
        input.value = val;
      }
  },

  //finds the index of a given element.
  getSubTodoIndex: function(obj, dataId) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        return i;
      }
      if (obj[i].subArray) {
        if (this.getSubTodoIndex(obj[i].subArray, dataId) !== undefined) {
          return this.getSubTodoIndex(obj[i].subArray, dataId);
        }
      }
    }
  },

  //Decides which array and what index to splice a new blank sub-todo.
  subPusher: function(obj, dataId) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        if (Array.isArray(obj[i].subArray) === false) {
          obj[i].subArray = [];
        }
        obj[i].subArray.splice(0, 0, {
          id: util.uuid(),
          title: '',
          completed: false,
          subArray: false
        })
        this.lastActiveInput = obj[i].subArray[0].id;
      }
      if (this.subPusher(obj[i].subArray, dataId) !== undefined) {
        this.subPusher(obj[i].subArray, dataId);
      }
    }

    App.render();
  },

  //retrieves data before recursion. Could probably be refactored.
  createSubTodo: function(e) {
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id');
    var subIndex = this.getSubTodoIndex(this.todos, dataId);

    this.subPusher(this.todos, dataId);
  },

  create: function (e) {
    var input = e.target;
    var val = input.value;
    var closestLi = input.closest('li');
    var dataId = closestLi.getAttribute('data-id');
    var subIndex = this.getSubTodoIndex(this.todos, dataId);

    if (e.which !== ENTER_KEY) {
        return;
    }
    this.createPusher(this.todos, dataId, subIndex);
    this.render();
  },

  //figures out which array to add a blank todo to.
  createPusher: function(obj, dataId, subIndex) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        obj.splice(subIndex + 1, 0, {
          id: util.uuid(),
          title: '',
          completed: false,
          subArray: false
        })
        this.lastActiveInput = obj[i + 1].id;
      }
      if (obj[i].subArray) {
        this.createPusher(obj[i].subArray, dataId, subIndex);
      }
    }
  },

  toggle: function (e) {
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id')
    var index = this.getSubTodoIndex(this.todos, dataId);
    this.toggleRecurser(this.todos, dataId, index);
    this.render();
  },

  toggleRecurser: function(obj, dataId, subIndex) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        obj[i].completed = !obj[i].completed;
      }
      if (obj[i].subArray) {
        this.toggleRecurser(obj[i].subArray, dataId, subIndex);
      }
    }
  },

  update: function (e) {
    var input = e.target;
    var val = input.value;
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id');

    this.updateRecurser(this.todos, val, dataId);
    this.lastActiveInput = dataId;
    this.render();
  },

  updateRecurser: function(obj, val, dataId) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        obj[i].title = val;
      }
      if (obj[i].subArray) {
        this.updateRecurser(obj[i].subArray, val, dataId);
      }
    }
  },

  destroy: function (e) {
    var closestLi = e.target.closest('li');
    var dataId = closestLi.getAttribute('data-id');
    var subIndex = this.getSubTodoIndex(this.todos, dataId);
    this.destroyRecurser(this.todos, dataId, subIndex);
    this.render();
  },

  destroyRecurser: function(obj, dataId, subIndex) {
    for (var i = 0; i < obj.length; i++) {
      if (obj[i].id === dataId) {
        obj.splice(subIndex, 1);
      }
      if (obj[i]) {
        if (obj[i].subArray) {
          this.destroyRecurser(obj[i].subArray, dataId, subIndex);
          if (obj[i].subArray.length === 0) {
            obj[i].subArray = false;
          }
        }
      }
    }
  },

}
App.init();
