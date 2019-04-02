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
    this.todos = util.store('todos');;
    this.bindEvents();
    this.render();
  },

  bindEvents: function() {
    var add = document.querySelector('#add');
    add.addEventListener('click', this.newInput.bind(this));
  },
  render: function() {
    var todos = this.getFilteredTodos();
    util.store('todos', this.todos);
    this.todoTemplate(todos);
  },

  todoTemplate: function(todos) {
    var mainTree = document.getElementById('main-tree');
    todos.forEach(function(todo, index, array) {
      var todoLi = document.createElement('li');
      todoLi.setAttribute('data-id', todo.id);
      todoLi.setAttribute('completed', todo.completed);
      todoLi.innerText = todo.title;
      mainTree.appendChild(todoLi);
    })

  },
  newLiInput: function(el) {
    //all lis have unique id
    if (el.target === 'span' /*first tree*/) {
      //create input, ul and li
      //create eventlister for li
    }
    //all new uls have id of parent li
    if (el.target === 'li'/* sub tree */) {
      //create input, ul and li
    }
    if (el.target === 'ul') {
      // create li
    }
  },

  newInput: function(el) {
    var inputExists = document.getElementById('new-todo');
    var ul = document.getElementById('main-tree');
    if (inputExists === null) {
      var newInput = document.createElement('input');
      newInput.setAttribute('id', 'new-todo');
      newInput.setAttribute('style', 'text');
      newInput.setAttribute('autofocus', 'autofocus');
      ul.appendChild(newInput);
      var newTodo = document.querySelector('#new-todo');
      newTodo.addEventListener('keyup', function (e) {
        App.create(e);
      })
    }
  },

  getActiveTodos: function () {
    return this.todos.filter(function (todo) {
      return !todo.completed;
    });
  },
  getCompletedTodos: function () {
    return this.todos.filter(function (todo) {
      return todo.completed;
    });
  },
  getFilteredTodos: function () {
    if (this.filter === 'active') {
      return this.getActiveTodos();
    }

    if (this.filter === 'completed') {
      return this.getCompletedTodos();
    }

    return this.todos;
  },

  create: function (e) {
			var input = (e.target);
			var val = input.value.trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: util.uuid(),
				title: val,
				completed: false
			});

			input.value = '';

			this.render();
		},
//</app>
}
App.init();
