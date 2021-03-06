<?php

/**
 * @file
 * Class definition of FeedsNodeProcessor.
 */

/**
 * Creates Entities from feed items.
 */
class FeedsEntityProcessor extends FeedsProcessor {

  public function entityType() {
    if (isset($this->config['entity_type'])) {
      return $this->config['entity_type'];
    }
    return 'node';
  }

  /**
   * Implements parent::entityInfo().
   */
  protected function entityInfo() {
    $info = parent::entityInfo();
    $info += array('label plural' => $info['label']);
    return $info;
  }

  /**
   * Creates a new entity in memory and returns it.
   */
  protected function newEntity(FeedsSource $source) {
    $entity = entity_property_values_create_entity($this->entityType(), $this->config['values'])->value();
    $entity->language = LANGUAGE_NONE;
    return $entity;
  }

  /**
   * Loads an existing entity.
   *
   * If the update existing method is not FEEDS_UPDATE_EXISTING, only the entity
   * table will be loaded, foregoing the entity_load API for better performance.
   */
  protected function entityLoad(FeedsSource $source, $id) {
    $result = entity_load($this->entityType(), array($id));
    return reset($result);
  }

  /**
   * Save a entity.
   */
  public function entitysave($entity) {
    entity_save($this->entityType(), $entity);
  }

  /**
   * Delete a series of entities.
   */
  protected function entityDeleteMultiple($ids) {
    entity_delete_multiple($this->entityType(), $ids);
  }
  /**
   * Override parent::configDefaults().
   */
  public function configDefaults() {
    return array(
      'entity_type' => NULL,
      'values' => array(),
    ) + parent::configDefaults();
  }

  /**
   * Override parent::configForm().
   */
  public function configForm(&$form_state) {

    if (isset($form_state['input']['values'])) {
      $this->config['values'] = $form_state['input']['values'];
    }

    $entity_types = array();
    foreach (entity_get_info() as $entity_type => $entity_info) {
      $entity_types[$entity_type] = $entity_info['label'];
      if (isset($form_state['input']['entity_type']) and $form_state['input']['entity_type'] == $entity_type) {
        $this->config['entity_type'] = $entity_type;
      }
    }

    $form['entity_type'] = array(
      '#type' => 'select',
      '#options' => $entity_types,
    );
    if (!isset($this->config['entity_type'])) {
      return $form;
    }

    $form += parent::configForm($form_state);

    $form['values']['#tree'] = TRUE;
    $form['input_format']['#description'] = t('Select the input format for the %entity to be created.', array('%entity' => $this->entityType()));

    $wrapper = entity_metadata_wrapper($this->entityType());

    foreach ($wrapper->getPropertyInfo() as $name => $property) {

      if (!empty($property['required'])) {
        $form['values'][$name] = array(
          '#type' => 'textfield',
          '#title' => $property['label'],
          '#description' => isset($property['description']) ? $property['description'] : '',
          '#default_value' => isset($this->config['values'][$name]) ? $this->config['values'][$name] : NULL,
          '#required' => TRUE,
        );

        if (!empty($property['options list'])) {
          $form['values'][$name]['#type'] = 'select';
          $form['values'][$name]['#options'] = $wrapper->$name->optionsList();
        }

        // @todo: Maybe implement per data-type forms like Rules does?
        $form['values'][$name]['#description'] .= ' ' . t('Expected data type: %type.', array('%type' => $wrapper->$name->type()));

        if ($wrapper->$name instanceof EntityDrupalWrapper) {
          $info = $wrapper->$name->entityInfo();
          $id_info = $wrapper->$name->get($info['entity keys']['id'])->info();
          $form['values'][$name]['#description'] .= ' ' . t('Just enter the identifier of the entity, i.e. %id', array('%id' => $id_info['label']));
        }
      }
    }

    return $form;
  }

  /**
   * Override setTargetElement to operate on a target item that is a entity.
   */
  public function setTargetElement(FeedsSource $source, $target_item, $target_element, $value, $mapping) {
    $wrapper = entity_metadata_wrapper($this->entityType(), $target_item);

    if (isset($this->targets[$target_element])) {
      $mapping_config = $this->targets[$target_element];
    }
    else {
      $mapping_config = array();
    }

    switch ($target_element) {
      case 'url':
      case 'guid':
        $target_item->feeds_item->$target_element = $value;
        break;
      default:
        if (!empty($mapping_config['column'])) {
          $field = $mapping_config['real_target'];
          $column = $mapping_config['column'];
          $wrapper->$field->$column = $value;
        }
        else {
          $wrapper->$target_element->set($value);
        }
        break;
    }
  }

  /**
   * Return available mapping targets.
   */
  public function getMappingTargets() {
    // Get a wrapper with the right bundle info.
    $entity_info = $this->entityInfo();
    $info = array('bundle' => NULL);

    if (isset($entity_info['entity keys']['bundle']) && isset($this->config['values'][$entity_info['entity keys']['bundle']])) {
      $info['bundle'] = $this->config['values'][$entity_info['entity keys']['bundle']];
    }
    else {
      $info['bundle'] = $this->entityType();
    }

    $wrapper = entity_metadata_wrapper($this->entityType(), NULL, $info);
    // @todo: maybe restrict to data types feeds can deal with.
    foreach ($wrapper->getPropertyInfo() as $name => $property) {

      if (!empty($property['setter callback'])) {
        if (!empty($property['property info'])) {
          foreach ($property['property info'] as $column => $column_info) {

            $targets[$name . ':' . $column] = array(
              'name' => $property['label'] . ': ' . $column,
              'description' => isset($column_info['label']) ? $column_info['label'] : NULL,
              'real_target' => $name,
              'column' => $column,
            );
          }
        }

        else {
          $targets[$name] = array(
            'name' => $property['label'],
            'description' => isset($property['description']) ? $property['description'] : NULL,
          );
        }
      }
    }
    $targets[$entity_info['entity keys']['id']]['optional_unique'] = TRUE;

    // Add general GUID target
    $targets['guid'] = array(
      'name' => t('GUID'),
      'description' => t('The globally unique identifier of the item. E. g. the feed item GUID in the case of a syndication feed. May be unique.'),
      'optional_unique' => TRUE,
    );

    // Let other modules expose mapping targets.
    self::loadMappers();
    $type = $this->entityType();
    // drupal_alter('feeds_processor_targets', $targets, $type, $info['bundle']);

    return $targets;
  }
}
