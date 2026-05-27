
function outer() {
  let count = 0;
  
  function render(val) {
    const currentVal = val;
    const func = () => {
      console.log('Value inside func:', currentVal);
    };
    
    if (count === 0) {
      // simulate useEffect with []
      global.capturedFunc = () => {
        func();
      };
    }
    
    count++;
  }
  
  render('first');
  render('second');
  
  global.capturedFunc();
}

outer();
