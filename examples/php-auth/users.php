<?php
  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */
  // Hardcoded user store (demo only)
  $users = [
      'test' => [
          'id' => 1,
          'handle' => 'test',
          'displayname' => 'Test User',
          'avatar' => '/images/avatars/test.png',
          'password' => 'secret'
      ],
      'alice' => [
          'id' => 2,
          'handle' => 'alice',
          'displayname' => 'Alice Wonderland',
          'avatar' => '/images/avatars/alice.png',
          'password' => 'rabbit'
      ],
      'bob' => [
          'id' => 3,
          'handle' => 'bob',
          'displayname' => 'Bobby Tables',
          'avatar' => '/images/avatars/bob.png',
          'password' => 'dropdb'
      ]
  ];

  return $users;
