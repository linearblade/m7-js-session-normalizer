<?php
  /*
 * Copyright (c) 2025 m7.org
 * License: MTL-10 (see LICENSE.md)
 */

  function parseInput($r) {
      $contentType = isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : "";
      $raw = file_get_contents("php://input");

      // Prefer JSON if Content-Type says so and body is non-empty
      if (stripos($contentType, "application/json") !== false && !empty($raw)) {
          $input = json_decode($raw, true);
          if (!is_array($input)) $input = array();

          return array(
              "username" => isset($input["username"]) ? $input["username"] : "",
              "password" => isset($input["password"]) ? $input["password"] : ""
          );
      }

      // Fallback: use passed array (e.g. $_REQUEST)
      return array(
          "username" => isset($r["username"]) ? $r["username"] : "",
          "password" => isset($r["password"]) ? $r["password"] : ""
      );
  }
