var Sequelize = require('sequelize');

var sequelize = new Sequelize('drinks', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
});

var Ingredient = sequelize.define('ingredient', {
  name: Sequelize.string,
  class: Sequelize.string,
  type: Sequelize.string,
  alcoholic: Sequelize.boolean,
  percentage: Sequelize.integer
});

var Recipe = sequelize.define('recipe', {
  name: Sequelize.string,
  alcoholic: Sequelize.boolean,
});

var Glass = sequelize.define('glass', {
  name: Sequelize.string,
  size: Sequelize.float,
});

var Style = sequelize.define('style', {
  name: Sequelize.string
});

var IngredientRecipe = sequelize.define('ingredientrecipe', {
  amount: Sequelize.float,
  unit: Sequelize.string
});

Ingredient.hasMany(IngredientRecipe, as:{'recipes'});
Recipe.hasMany(IngredientRecipe, as:{'items'});
Recipe.hasOne(Glass, as:{'glass'});
Recipe.hasOne(Style, as:{'style'});
