

function render() {
  var ul = document.getElementById('main-tree');
  var li = document.createElement('li');
  var div = document.createElement('div');
  var a = document.createElement('a');
  var input = document.createElement('input');
  var label = document.createElement('label');

  label.innerText = "Luke";
  input.setAttribute('style', 'text');
  input.setAttribute('id', 'new-input');
  a.innerText = '•';
  div.className = 'same-row';

  div.appendChild(a);
  div.appendChild(input);
  div.appendChild(label);
  li.appendChild(div);
  ul.appendChild(li)

  var timeoutID;
  var newInput = window.newInput = document.getElementById('new-input');

  function delayedAlert() {
  timeoutID = window.setTimeout(newInput.focus(), 2000);
  }
  delayedAlert();

}

render();
