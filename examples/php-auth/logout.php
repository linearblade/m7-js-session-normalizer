<?php
  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
  session_start();
  header("Content-Type: application/json");

  $_SESSION = [];
  session_destroy();

  setcookie(session_name(), '', time() - 3600, '/'); // clear cookie

  echo json_encode(['ok' => true, 'message' => 'Logged out']);
