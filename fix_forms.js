const fs = require('fs');
const path = require('path');

const targetStr = `function handleReviewSubmit(e){
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const og = btn.innerHTML;
  btn.innerHTML = '⏳ Submitting...';
  
  const form = e.target;
  const data = new FormData(form);
  
  // Submit to Formspree (Fallback endpoint for static hosting)
  fetch("https://formspree.io/f/replace_me_with_your_form_id", {
    method: "POST",
    body: data,
    headers: {
      'Accept': 'application/json'
    }
  }).then(response => {
    if (response.ok) {
      btn.innerHTML = '✓ Message Sent!';
      btn.style.background = 'linear-gradient(135deg,#10B981,#10B981)';
      form.reset();
    } else {
      btn.innerHTML = '❌ Error Submitting';
      btn.style.background = 'linear-gradient(135deg,#EF4444,#EF4444)';
    }
  }).catch(error => {
    btn.innerHTML = '❌ Error Submitting';
    btn.style.background = 'linear-gradient(135deg,#EF4444,#EF4444)';
  }).finally(() => {
    setTimeout(()=>{
      btn.innerHTML = og;
      btn.style.background = '';
    }, 3000);
  });`;

const replacementStr = `function handleReviewSubmit(e){
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const og = btn.innerHTML;
  btn.innerHTML = '⏳ Submitting...';
  
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  
  if(!data.rating) data.rating = 5;
  
  // Submit to our actual API
  fetch("/api/reviews", {
    method: "POST",
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).then(response => response.json())
  .then(result => {
    if (result.success || result.review) {
      btn.innerHTML = '✓ Review Sent!';
      btn.style.background = 'linear-gradient(135deg,#10B981,#10B981)';
      form.reset();
    } else {
      btn.innerHTML = '❌ Error Submitting';
      btn.style.background = 'linear-gradient(135deg,#EF4444,#EF4444)';
    }
  }).catch(error => {
    btn.innerHTML = '❌ Error Submitting';
    btn.style.background = 'linear-gradient(135deg,#EF4444,#EF4444)';
  }).finally(() => {
    setTimeout(()=>{
      btn.innerHTML = og;
      btn.style.background = '';
    }, 3000);
  });`;

const files = ['about.html', 'apps.html', 'contact.html', 'tech.html'];
files.forEach(f => {
  const p = path.join(__dirname, f);
  if(fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    if (content.includes(targetStr)) {
      content = content.replace(targetStr, replacementStr);
      fs.writeFileSync(p, content, 'utf8');
      console.log('Fixed', f);
    } else {
      console.log('Target string not found in', f, 'or it was already fixed.');
    }
  }
});
