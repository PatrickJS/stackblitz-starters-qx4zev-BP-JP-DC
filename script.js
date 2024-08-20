// script.js

// Helper function to safely get numeric values from inputs
function getNumericValue(inputId, defaultValue = 0) {
  const value = parseFloat(document.getElementById(inputId)?.value);
  return isNaN(value) ? defaultValue : value;
}

// Helper function to get form values and convert them to JSON
function getFormValues() {
  const atk = getNumericValue('atk');
  const elementalAtk = getNumericValue('elemental-atk');
  const enemyDef = getNumericValue('enemy-def');
  const skillDamage = getNumericValue('skill-damage');
  const critDamage = getNumericValue('crit-damage') / 100;
  const elementalResistance = getNumericValue('elemental-resistance') / 100;

  // Get values from multi-select dropdowns
  const variousModifiers =
    getCombinedModifierValue('known-various-modifiers') *
    getNumericValue('various-modifiers', 1);
  const decimalModifiers =
    getCombinedModifierValue('known-decimal-modifiers') *
    getNumericValue('decimal-modifiers', 1);

  return {
    atk,
    elementalAtk,
    enemyDef,
    skillDamage,
    critDamage,
    elementalResistance,
    variousModifiers,
    decimalModifiers,
  };
}

// Helper function to get combined value from multi-select dropdown
function getCombinedModifierValue(selectId) {
  const selectElement = document.getElementById(selectId);
  if (!selectElement) return 1; // Fallback in case the select element is missing
  const selectedOptions = Array.from(selectElement.selectedOptions);
  return selectedOptions.length
    ? selectedOptions.reduce(
        (total, option) => total * parseFloat(option.value),
        1
      )
    : 1; // If no options are selected, return 1
}

// Damage calculation function
function calculateDamage(values) {
  const {
    atk,
    elementalAtk,
    enemyDef,
    skillDamage,
    critDamage,
    elementalResistance,
    variousModifiers,
    decimalModifiers,
  } = values;

  const baseDamage =
    atk + elementalAtk + Math.sqrt(atk) * elementalAtk - enemyDef / 2;

  // Calculate min, max, and average damage
  const minRandFactor = 0.97;
  const maxRandFactor = 1.03;
  const averageRandFactor = (minRandFactor + maxRandFactor) / 2;

  const minDamage = Math.max(
    1,
    Math.round(
      baseDamage *
        skillDamage *
        (1 + critDamage) *
        elementalResistance *
        minRandFactor *
        variousModifiers *
        decimalModifiers
    )
  );

  const maxDamage = Math.max(
    1,
    Math.round(
      baseDamage *
        skillDamage *
        (1 + critDamage) *
        elementalResistance *
        maxRandFactor *
        variousModifiers *
        decimalModifiers
    )
  );

  const avgDamage = Math.max(
    1,
    Math.round(
      baseDamage *
        skillDamage *
        (1 + critDamage) *
        elementalResistance *
        averageRandFactor *
        variousModifiers *
        decimalModifiers
    )
  );

  return { minDamage, maxDamage, avgDamage };
}

// Function to update the output DOM with the calculated damage range
function updateDamageOutput(damage) {
  document.getElementById(
    'min-damage'
  ).textContent = `Min: ${damage.minDamage}`;
  document.getElementById(
    'max-damage'
  ).textContent = `Max: ${damage.maxDamage}`;
  document.getElementById(
    'avg-damage'
  ).textContent = `Average: ${damage.avgDamage}`;
}

// Function to handle the "Attack" button click for a random damage calculation
function handleAttackClick(damage) {
  const randomFactor = Math.random() * (1.03 - 0.97) + 0.97;
  const randomDamage = Math.round(
    damage.avgDamage * (randomFactor / ((1.03 + 0.97) / 2))
  );
  document.getElementById(
    'random-damage'
  ).textContent = `Attack Damage: ${randomDamage}`;
}

// Function to update both formula and output when values change
function updateFormulaAndOutput() {
  const values = getFormValues();
  const damage = calculateDamage(values);
  updateDamageOutput(damage);
}

// Attach event listeners to all input fields for real-time updates
function attachInputListeners() {
  const inputs = document.querySelectorAll(
    '#damage-form input, #damage-form select'
  );

  inputs.forEach((input) => {
    input.addEventListener('input', updateFormulaAndOutput);
    input.addEventListener('change', updateFormulaAndOutput);
  });
}

// Initialize event listeners and default values on page load
document.addEventListener('DOMContentLoaded', function () {
  attachInputListeners();
  updateFormulaAndOutput();
});

document.getElementById('attack-button').addEventListener('click', function () {
  const values = getFormValues();
  const damage = calculateDamage(values);
  handleAttackClick(damage);
});
