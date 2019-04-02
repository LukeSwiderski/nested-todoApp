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
  var ul = window.ul = document.getElementById('main-tree');
  this.events();
  this.render();
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
  // todoList.addEventListener('change', function(e) {
  //   var elClicked = event.target;
  //   if (elClicked.className === 'edit') {
  //     App.edit(e);
  //   }
  // })
  // todoList.addEventListener('keyup', function(e) {
  //   var elClicked = event.target;
  //   if (elClicked.className === 'edit') {
  //     App.edit(e);
  //   }
  // })
  // todoList.addEventListener('click', function(e) {
  //   var elClicked = event.target;
  //   if (elClicked.className === 'edit') {
  //     App.edit(e);
  //   }
  // })
  // todoList.addEventListener('keyup', function(e) {
  //   var elClicked = event.target;
  //   if (elClicked.className === 'editing') {
  //     App.editKeyup(e);
  //   }
  // })
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
  document.getElementById('main-tree').innerHTML = (this.todoTemplate(this.todos));
  //while obj has subArray
  //select LI element with data-id
  //inner html = this.todotemplate(subarray)
  this.renderSubs(this.todos);
  this.whereToFocus();
  // var input = document.getElementById('focus');
  // input.focus();
  // var val = input.getAttribute('value');
  // input.value = '';
  // input.value = val;
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
      newUl.innerHTML = (this.todoTemplate(obj[i].subArray));
      newUl.style.marginLeft = '2%';
      this.renderSubs(obj[i].subArray);
    }
  }
},
// closestInput: function(dataId) {
//   for (var i = 0; i < ul.childNodes.length; i++) {
//     if (ul.childNodes[i].nodeName === 'LI') {
//       var li = ul.childNodes[i];
//       if (li.getAttribute('data-id') === dataId) {
//         for (var j = 0; j < li.childNodes.length; j++) {
//           if (li.childNodes[j].nodeName = 'INPUT') {
//             return j;
//           }
//         }
//       }
//     }
//   }
// },
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
findOldestAncestorIndex: function(obj, dataId) {
  for (var i = 0; i < obj.length; i++) {
    if (obj[i].id === dataId) {
      return i;
    }
    if (obj[i].subArray) {
      if (this.findOldestAncestorIndex(obj[i].subArray, dataId) !== undefined) {
        return i;
      }
    }
  }
},
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
depthFinder: function(obj, dataId) {
  for (var i = 0; i < obj.length; i++) {
    if (obj[i].id === dataId) {
      return obj[i].depth;
    }
    if (obj[i].subArray) {
      if (this.depthFinder(obj[i].subArray, dataId) !== undefined) {
        return this.depthFinder(obj[i].subArray, dataId);
      }
    }
  }
},
subPusher: function(obj, dataId) {
  //if obj is this.todos and ids match, push
  //if obj is deeper than first tree, Recurse;
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
edit: function (e) {
  var li = e.target.closest('li');
  if (li.lastElementChild.nodeName === 'UL') {
    var input = li.lastElementChild.previousElementSibling;
  }else {
    var input = li.lastElementChild;
  }
  input.className = 'editing';
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
destroy: function (e) {
  var closestLi = e.target.closest('li');
  var dataId = closestLi.getAttribute('data-id');
  var subIndex = this.getSubTodoIndex(this.todos, dataId);
  this.destroyRecurser(this.todos, dataId, subIndex);
  this.render();
}
//</app>
}
App.init();
