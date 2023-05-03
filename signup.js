// Get a reference to the Firebase authentication service
const auth = firebase.auth();

// Get a reference to the Firebase Firestore service
const db = firebase.firestore();

// Get references to the form fields
const form = document.querySelector('form');
const usernameInput = document.querySelector('#username');
const emailInput = document.querySelector('#email');
const passwordInput = document.querySelector('#password');

// Listen for the form submit event
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Get the form values
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Check that all form fields are filled out
  if (!username || !email || !password) {
    alert('Please fill out all form fields');
    return;
  }

  try {
    // Create a new user with the email and password
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);

    // Get the new user's ID
    const userId = userCredential.user.uid;

    // Check if the username is already taken
    const usernameExists = await db.collection('users').where('username', '==', username).get();

    if (usernameExists.size > 0) {
      alert('Username is already taken. Please choose another one.');
      return;
    }

    // Add the new user's data to Firestore
    await db.collection('users').doc(userId).set({
      username: username,
      email: email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });

    // Redirect to the main page
    window.location.href = 'index.html';
  } catch (error) {
    alert(error.message);
  }
});
