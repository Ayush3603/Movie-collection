document.addEventListener('DOMContentLoaded', () => {
  console.log('Todo app loaded!');
  
  const input = document.querySelector('input[type="text"]');
  if (input) {
    input.focus();
  }
});
