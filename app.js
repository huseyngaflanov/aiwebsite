// Initialize Firebase
const db = firebase.firestore();
const storage = firebase.storage();
const auth = firebase.auth();

// Get references to HTML elements
const postForm = document.querySelector('form');
const postContent = document.querySelector('#post-content');
const postsList = document.querySelector('#posts-list');
const searchForm = document.querySelector('aside form');
const searchInput = document.querySelector('#search-friends');
const friendsList = document.querySelector('#friends-list');

// Listen for form submit events
postForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevent page reload

  // Get the current user's ID
  const userId = auth.currentUser.uid;

  // Add a new post to the database
  db.collection('posts').add({
    content: postContent.value,
    author: userId,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(() => {
    // Clear the form
    postContent.value = '';
  })
  .catch(error => {
    console.error('Error writing document:', error);
  });
});

// Listen for changes to the posts collection
db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(querySnapshot => {
  // Clear the current list of posts
  postsList.innerHTML = '';

  // Loop through the posts and add them to the list
  querySnapshot.forEach(doc => {
    const post = doc.data();
    const li = document.createElement('li');
    li.innerHTML = `
      <div>${post.content}</div>
      <div>By: ${post.author}</div>
      <div>${post.timestamp.toDate().toLocaleString()}</div>
    `;
    postsList.appendChild(li);
  });
});

// Listen for form submit events
searchForm.addEventListener('submit', e => {
  e.preventDefault(); // Prevent page reload

  // Search for friends in the database
  db.collection('users').where('name', '==', searchInput.value).get()
  .then(querySnapshot => {
    // Clear the current list of friends
    friendsList.innerHTML = '';

    // Loop through the friends and add them to the list
    querySnapshot.forEach(doc => {
      const friend = doc.data();
      const li = document.createElement('li');
      li.innerHTML = `
        <div>${friend.name}</div>
        <button data-id="${doc.id}">Subscribe</button>
      `;
      friendsList.appendChild(li);
    });
  })
  .catch(error => {
    console.error('Error searching for friends:', error);
  });
});

// Listen for click events on the subscribe buttons
friendsList.addEventListener('click', e => {
  if (e.target.tagName === 'BUTTON') {
    const friendId = e.target.dataset.id;
    const userId = auth.currentUser.uid;

    // Add the friend to the current user's subscriptions
    db.collection('users').doc(userId).update({
      subscriptions: firebase.firestore.FieldValue.arrayUnion(friendId)
    })
    .then(() => {
      console.log('Subscription added!');
    })
    .catch(error => {
      console.error('Error adding subscription:', error);
    });
  }
});
