UnlimAI (GPT | Claude | MidJourney):
// Replace with your actual Facebook App ID
const FACEBOOK_APP_ID = 'YOUR_APP_ID';

let accessToken = null; // Store the user's access token

// Initialize the Facebook SDK
window.fbAsyncInit = function() {
    FB.init({
        appId            : FACEBOOK_APP_ID,
        cookie           : true,                     // Enable cookies to allow the server to access the session
        xfbml            : true,                     // Parse social plugins on this page
        version          : 'v18.0'                   // Specify Graph API version
    });

    // Check the current login status
    FB.getLoginStatus(function(response) {
        statusChangeCallback(response);
    });
};

// This function is called when the user logs in or out, or on page load.
function statusChangeCallback(response) {
    const statusDiv = document.getElementById('status');
    const postArea = document.getElementById('post-area');
    const loginButton = document.getElementById('login-button');

    if (response.status === 'connected') {
        // Logged into your app and Facebook.
        accessToken = response.authResponse.accessToken;
        statusDiv.innerHTML = '<p class="success">Logged in! Fetching your managed groups...</p>';
        loginButton.style.display = 'none';
        postArea.style.display = 'block';
        getManagedGroups();
    } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
        statusDiv.innerHTML = '<p class="error">Please log into this app.</p>';
        loginButton.style.display = 'block';
        postArea.style.display = 'none';
    } else {
        // The person is not logged into Facebook, so we're not sure if they are logged into this app or not.
        statusDiv.innerHTML = '<p>Please log in with Facebook.</p>';
        loginButton.style.display = 'block';
        postArea.style.display = 'none';
    }
}

// Function to handle Facebook login
function login() {
    // Request 'user_managed_groups' and 'publish_to_groups' permissions
    // IMPORTANT: 'publish_to_groups' requires Facebook App Review and strong justification.
    // Without it, you cannot post, only list.
    FB.login(function(response) {
        statusChangeCallback(response);
    }, {scope: 'public_profile,user_managed_groups,publish_to_groups'});
}

// Function to fetch groups the user manages
function getManagedGroups() {
    document.getElementById('loading-groups').style.display = 'block';

    document.getElementById('no-groups').style.display = 'none';
    document.getElementById('managed-groups').innerHTML = '';

    FB.api('/me/groups', {fields: 'name,id,privacy,administrator'}, function(response) {
        document.getElementById('loading-groups').style.display = 'none';

        if (response && !response.error) {
            const managedGroups = response.data.filter(group => group.administrator === true);
            const managedGroupsDiv = document.getElementById('managed-groups');

            if (managedGroups.length > 0) {
                managedGroups.forEach(group => {
                    const div = document.createElement('div');
                    div.className = 'group-item';
                    div.innerHTML = `
                        <input type="checkbox" id="group-${group.id}" value="${group.id}">
                        <label for="group-${group.id}">${group.name} (${group.privacy} Group)</label>
                    `;
                    managedGroupsDiv.appendChild(div);
                });
            } else {
                document.getElementById('no-groups').style.display = 'block';
            }
        } else {
            document.getElementById('no-groups').style.display = 'block';
            logMessage(`Error fetching groups: ${response.error.message}`, 'error');
        }
    });
}

// Function to post the message to selected groups
function postToSelectedGroups() {
    const message = document.getElementById('post-message').value.trim();
    if (!message) {
        alert('Please enter a message to post.');
        return;
    }

    const selectedGroupIds = [];
    document.querySelectorAll('#managed-groups input[type="checkbox"]:checked').forEach(checkbox => {
        selectedGroupIds.push(checkbox.value);
    });

    if (selectedGroupIds.length === 0) {
        alert('Please select at least one group to post to.');
        return;
    }

    logMessage(`Attempting to post to ${selectedGroupIds.length} groups...`, 'info');

    selectedGroupIds.forEach(groupId => {
        FB.api(
            `/${groupId}/feed`,
            'POST',
            {"message": message},
            function(response) {
                if (response && !response.error) {
                    logMessage(`Successfully posted to group ID ${groupId}. Post ID: ${response.id}`, 'success');
                } else {
                    logMessage(`Error posting to group ID ${groupId}: ${response.error.message}`, 'error');
                }
            }
        );
    });
}

// Helper function to log messages to the UI
function logMessage(message, type = 'info') {
    const logOutput = document.getElementById('log-output');
    const p = document.createElement('p');
    p.className = type;
    p.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logOutput.prepend(p); // Add newest message at the top
}
