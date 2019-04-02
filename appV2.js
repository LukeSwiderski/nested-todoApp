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
    window.mainSection = document.getElementById('mainSection');
    this.todos = util.store('todos');;
    this.bindEvents();
    this.render();
  },

  bindEvents: function() {
    var firstInput = document.querySelector('#plus');
    firstInput.addEventListener('click', this.createInput.bind(this));
  },
  render: function() {
    var todos = this.getFilteredTodos();
    util.store('todos', this.todos);
    this.todoTemplate(todos);
  },

  todoTemplate: function(todos) {
    //figure out how to tell if todo belongs to main tree
    todos.forEach(function(todo, index, array) {
      var ul = document.getElementById('main-tree');
      var a = document.createElement('a');
      var li = document.createElement('li');
      var label = document.createElement('label');
      var input = document.createElement('input');

      a.innerText = '•';
      li.setAttribute('id', todo.id);
      input.clasName = 'hidden';
      label.innerText = todo.title;
      li.appendChild(a);
      li.appendChild(input)
      li.appendChild(label);
      ul.appendChild(li);
    })
  },
  branchCreate: function(e) {
    var a = document.createElement('a');
    var li = document.createElement('li');
    var label = document.createElement('label');
    var input = document.createElement('input');

    a.innerText = '•';
    li.appendChild(a);
    li.appendChild(input)
    li.appendChild(label);
  },
  //create an input and append it to element clicked
  createInput: function(e) {
    var input = document.createElement('input');
    var mainTree = document.getElementById('main-tree');
    var anchor = document.createElement('a');
    var plus = document.getElementById('plus');

    anchor.innerText = '•';
    input.className = 'same-row';
    input.setAttribute('style', 'text')
    input.setAttribute('autofocus', 'autofocus');
    if (e === undefined) {
      mainTree.appendChild(input);
    }
    if (e.target === plus) {
      mainTree.appendChild(input);
      var callCreate = window.callCreate = function callCreate(e) {
        App.create(e);
      };
      var selectInput = document.querySelector('input');
      selectInput.addEventListener('keyup', callCreate);
    }else {
      e.target.appendChild(input);
    }
  },

  assignTreeIds: function(id) {
    var selectInput = document.querySelectorAll('input[tree-id="new-tree"]');
    selectInput[0].setAttribute('tree-id', id);
    var selectUl = document.querySelectorAll('ul[tree-id="new-tree"]');
    var ulId = 'U' + id;
    selectUl[0].setAttribute('id', ulId);
    var selectAnchor = document.querySelectorAll('a[tree-id="new-tree"]');
    selectAnchor[0].setAttribute('tree-id', id);
  },

  inputHandler: function(e) {
    e.target.removeEventListener('keyup', callCreate);
    e.target.className = 'hidden';
  },

  anchorHandler: function() {
    var anchor = document.getElementById('plus');
    anchor.remove();
  },

  newTree: function(e) {
    //create ul
    var ul = document.createElement('ul');
    var parent = e.target.parentNode;
    ul.className = 'same-row';
    ul.setAttribute('tree-id', 'new-tree');
    parent.appendChild(ul);
    //create anchor
    var anchor = document.createElement('a');
    anchor.className = 'same-row';
    anchor.innerText = '•';
    anchor.setAttribute('tree-id', 'new-tree');
    ul.appendChild(anchor);
    //create input
    var input = document.createElement('input');
    input.className = 'same-row';
    input.setAttribute('style', 'text')
    input.setAttribute('autofocus', 'autofocus');
    input.setAttribute('tree-id', 'new-tree');
    anchor.appendChild(input);

    var callCreate = window.callCreate = function callCreate(e) {
      App.create(e);
    };
    var selectInput = document.querySelectorAll('input[tree-id="new-tree"]');
    selectInput[0].addEventListener('keyup', callCreate);
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
    var id = util.uuid();
    var ulAncestor = e.target.closest('ul');
    var parent = ulAncestor.parentNode;

		if (e.which !== ENTER_KEY || !val) {
			return;
		}

		this.todos.push({
			id: id,
			title: val,
			completed: false
		});

		input.value = '';

    this.anchorHandler();
    this.inputHandler(e);
		this.render();
	},
//</app>
}
App.init();
