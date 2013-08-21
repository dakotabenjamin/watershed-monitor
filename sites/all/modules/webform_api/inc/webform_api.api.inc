<?php

/**
 * @file
 * API functions for webform_api module
 */

/**
 * Return an array with all the webforms available in the system.
 *
 * @return array
 *   Associative array containing the webform names, indexed by webform nid.
 */
function webform_api_get_available_webforms() {
  $available_webforms = array();

  $webforms = db_select('node', 'nd')
    ->fields('nd', array('title', 'nid'))
    ->condition('type', 'webform')
    ->execute()
    ->fetchAll();

  foreach ($webforms as $webform) {
    $available_webforms[$webform->nid] = $webform->title;
  }

  return $available_webforms;
}

/**
 * Get the webform components from the given $webform_nid.
 *
 * @param int $webform_nid
 *   The id of the webform to get the components from.
 *
 * @return array
 *   Associative array containing the webforms components.
 */
function webform_api_get_webform_components($webform_nid) {
  $webform_components = array();

  if (!empty($webform_nid)) {
    $node = node_load($webform_nid);
    $is_webform = ($node->type == 'webform');
    if ($is_webform) {
      $webform_components = webform_component_list($node);
    }
  }

  return $webform_components;
}

/**
 * Return a default field definition to map a field to a webform field.
 *
 * @param array $webform_components
 *   Array returned by commerce_cemhub_get_associated_webform_components();
 * @param string $field_title
 *   The title of the generated field.
 * @Param boolean $required
 *   Whether or not the field should be required.
 * @param string $default_value
 *   The default value to assign to the field
 *
 * @return array
 *   Field definition, as per Drupal's Form API.
 */
function webform_api_get_mapping_field_definition($webform_components, $field_title, $required = FALSE, $default_value = '') {
  return array(
    '#type' => 'select',
    '#title' => $field_title,
    '#options' => $webform_components,
    '#default_value' => $default_value,
    '#required' => $required,
  );
}

/**
 * Given a webform component id, return the form key associated to it.
 *
 * This value should be used to validate form using $form_state. For example:
 * $form_state['values'][<$formkey>]
 *
 * @param int $webform_nid
 *   The id of the webform the component belongs to.
 * @param int $cid
 *   The webform component id to get the form key for.
 *
 * @return string
 *   The form key for the given component id. Empty string if none is found.
 */
function webform_api_get_webform_component_formkey_by_cid($webform_nid, $cid) {
  $result = db_select('webform_component', 'wc')
    ->fields('wc', array('form_key '))
    ->condition('nid', $webform_nid)
    ->condition('cid', $cid)
    ->execute()
    ->fetchCol();

  $formkey = '';
  if (isset($result[0])) {
    $formkey = $result[0];
  }

  return $formkey;
}

/**
 * Return an associative array with the year options.
 *
 * It ranges from current year down to (current year - $max_years).
 *
 * @return array $years
 */
function webform_api_get_year_options($max_years = 100) {
  $current_year = intval(date('Y'));
  $minimum_year = $current_year - $max_years;

  for ($year = $current_year; $year >= $minimum_year; $year--) {
    $years[$year] = $year;
  }

  return $years;
}
