<?php
  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
  session_start();
  header("Content-Type: application/json");
  $users = require __DIR__."/users.php";
  require __DIR__."/shared.php"; //parseInput
  
  $input = parseInput($_REQUEST);
  $username = $input['username'];
  $password = $input['password'];
  // Validate user
  if (isset($users[$username]) && $users[$username]['password'] === $password) {
      $user = $users[$username];
      unset($user['password']); // don't expose password
      $_SESSION['user'] = $username;

      echo json_encode(['ok' => true, 'user' => $user]);
      exit;
  }

  // Failure
  http_response_code(401);
  echo json_encode(['ok' => false, 'error' => 'Invalid credentials']);


