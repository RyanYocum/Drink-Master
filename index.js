var Hapi = require('hapi');

var server = new Hapi.Server();
server.connection({port: 3000});

var Sequelize = require('sequelize');

var sequelize = new Sequelize('drinks', 'postgres', 'postgres', {
  host: 'localhost',
  dialect: 'postgres'
});

var Ingredient = sequelize.define('ingredient', {
  name: Sequelize.STRING,
  class: Sequelize.STRING,
  type: Sequelize.STRING,
  alcoholic: Sequelize.BOOLEAN,
  percentage: Sequelize.FLOAT
});

var Recipe = sequelize.define('recipe', {
  name: Sequelize.STRING,
  alcoholic: Sequelize.BOOLEAN,
  type: Sequelize.STRING,
  subtype: Sequelize.STRING
});

var Glass = sequelize.define('glass', {
  name: Sequelize.STRING,
  size: Sequelize.FLOAT,
});

var Style = sequelize.define('style', {
  name: Sequelize.STRING
});

var IngredientRecipe = sequelize.define('ingredientrecipe', {
  amount: Sequelize.FLOAT,
  unit: Sequelize.STRING
});

Ingredient.belongsToMany(Recipe, {as: 'item', through: 'ingredientrecipe'});
Recipe.belongsToMany(Ingredient, {as:'item', through: 'ingredientrecipe'});
Recipe.hasOne(Glass, {as: 'glass'});
Recipe.hasOne(Style, {as: 'style'});

sequelize.sync()

server.register(require('inert'), function (err) {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./index.html');
        }
    });
});

server.route({
  method: 'POST',
  path: '/submit',
  handler: function (req, rep) {
    Recipe.findOrCreate({where: {name: req.payload.name}, defaults: {
      type: req.payload.style,
      alcoholic: true
    }}).spread(function (recipe, created) {
      // console.log(recipe)
      if (created === false) {
        rep('ALREADY THERE');
      }
      else {
        for (var i = 0; i < req.payload.ingredient.length; i++) {
          Ingredient.findOrCreate({where: {name: req.payload.ingredient[i]}, defaults: {
            alcoholic: true,
            class: "liqueur",
            type: "what was type supposed to be?"
            }
          }).spread(function (ingredient) {
            ingredient.addItem(recipe).then(function () {
              recipe.addItem(ingredient).then(function () {
                IngredientRecipe.find({where: {recipeId: recipe.id, ingredientId: ingredient.id}}).then(function (item) {
                  item.updateAttributes({
                    unit: "fl oz",
                    amount: 2
                  })
                })
                
              })
            })
          })
        }
      }
    })
    rep('YAY');
  }
})

server.start(function () {
    console.log('Server running at:', server.info.uri);
});