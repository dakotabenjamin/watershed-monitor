<?php
/**
 * @file
 * metadata.features.inc
 */

/**
 * Implements hook_node_info().
 */
function metadata_node_info() {
  $items = array(
    'metadata' => array(
      'name' => t('Metadata'),
      'base' => 'node_content',
      'description' => '',
      'has_title' => '1',
      'title_label' => t('Well Code'),
      'help' => t('A unique identifier (i.e LTL01)'),
    ),
  );
  return $items;
}
