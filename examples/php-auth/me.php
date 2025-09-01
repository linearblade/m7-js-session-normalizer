<?php
  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
   */
  
  // Load user store
  $users = require __DIR__ . "/users.php";

  // Start session
  session_start();

  // Always return JSON
  header("Content-Type: application/json");

  // Check if a user is logged in
 if (isset($_SESSION['user'])) {
     $sessionUser = $_SESSION['user'];
     $user = $users[$sessionUser];
     unset ($user['password']);
     if ( $users[$sessionUser] ){
	 echo json_encode(array(
             'ok'   => true,
             'user' => $user
	 ));
	 exit;
     }
  }

  // If no user session
  http_response_code(401);
  echo json_encode(array(
      'ok'    => false,
      'error' => 'Not logged in'
  ));
